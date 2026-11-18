"use client";

import { MarketplacePhoto } from "@/components/marketplace-photo";
import { formatDate, tx, type Lang } from "@/lib/i18n";
import {
  formatTwd,
  isLatePayment,
  orderStatusLabel,
  orderStatuses,
  paymentStatusLabel,
  stockLabel,
  type AdminTransaction,
  type ListingQuote,
  type ListingStatus,
  type OrderStatus,
} from "@/lib/marketplace-record";
import { FormEvent, useEffect, useMemo, useState } from "react";

const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";
const actionButton =
  "inline-flex h-10 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-ink hover:border-burgundy disabled:opacity-40";
const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

const errorText: Record<string, { en: string; zh: string }> = {
  unauthorized: { en: "Sign in again.", zh: "請重新登入。" },
  forbidden: { en: "Only a super admin can change the platform fee.", zh: "只有超級管理員可以修改平台手續費。" },
  not_found: { en: "That listing was not found.", zh: "找不到這則刊登。" },
  invalid_request: { en: "Check the form and try again.", zh: "請檢查表單後再試一次。" },
  invalid_fee: { en: "Enter a whole number from 0 to 100000.", zh: "請輸入 0 到 100000 的整數。" },
  settings_missing: { en: "The platform fee is unavailable.", zh: "目前讀不到平台手續費。" },
  load_failed: { en: "The marketplace admin could not be loaded.", zh: "市集管理無法載入。" },
  save_failed: { en: "The change could not be saved.", zh: "無法儲存這項變更。" },
};

function message(lang: Lang, code: string) {
  return tx(lang, errorText[code] ?? errorText.save_failed);
}

function taipeiDate(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function amountBound(value: string) {
  if (!value.trim()) return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) return undefined;
  return number;
}

export function AdminMarketplace({ lang }: { lang: Lang }) {
  const [listings, setListings] = useState<ListingQuote[]>([]);
  const [orders, setOrders] = useState<AdminTransaction[]>([]);
  const [role, setRole] = useState<"admin" | "super_admin" | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [feeInput, setFeeInput] = useState("");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [buyer, setBuyer] = useState("");
  const [seller, setSeller] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savingFee, setSavingFee] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/marketplace")
      .then(async (response) => {
        const body = (await response.json()) as {
          error?: string;
          listings?: ListingQuote[];
          orders?: AdminTransaction[];
          platform_fee_twd?: number;
          role?: "admin" | "super_admin";
        };
        if (!response.ok) throw new Error(body.error ?? "load_failed");
        if (!active) return;
        setListings(body.listings ?? []);
        setOrders(body.orders ?? []);
        setRole(body.role ?? null);
        setFee(typeof body.platform_fee_twd === "number" ? body.platform_fee_twd : null);
        setFeeInput(typeof body.platform_fee_twd === "number" ? String(body.platform_fee_twd) : "");
      })
      .catch((reason: unknown) => {
        if (active) setError(message(lang, reason instanceof Error ? reason.message : "load_failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lang]);

  const min = amountBound(amountMin);
  const max = amountBound(amountMax);
  const amountError = min === undefined || max === undefined || (min !== null && max !== null && min > max);

  const visibleOrders = useMemo(() => {
    if (amountError) return [];
    const idNeedle = orderId.trim().toLowerCase();
    const buyerNeedle = buyer.trim().toLowerCase();
    const sellerNeedle = seller.trim().toLowerCase();
    return orders.filter((order) => {
      if (idNeedle && !order.id.toLowerCase().includes(idNeedle)) return false;
      if (status && order.status !== status) return false;
      if (buyerNeedle && !order.buyer_name.toLowerCase().includes(buyerNeedle)) return false;
      if (sellerNeedle && !order.seller_name.toLowerCase().includes(sellerNeedle)) return false;
      if (min !== null && order.total_twd < min) return false;
      if (max !== null && order.total_twd > max) return false;
      return true;
    });
  }, [orders, orderId, status, buyer, seller, min, max, amountError]);

  const totals = useMemo(
    () => ({
      count: visibleOrders.length,
      amount: visibleOrders.reduce((sum, order) => sum + order.total_twd, 0),
      fees: visibleOrders.reduce((sum, order) => sum + order.platform_fee_twd, 0),
    }),
    [visibleOrders],
  );

  async function moderate(listing: ListingQuote, next: ListingStatus) {
    setBusyId(listing.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/marketplace/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, status: next }),
      });
      const body = (await response.json()) as ListingQuote | { error?: string };
      if (!response.ok || !body || !("id" in body)) {
        const code = body && "error" in body && typeof body.error === "string" ? body.error : "save_failed";
        throw new Error(code);
      }
      setListings((current) => current.map((item) => (item.id === body.id ? body : item)));
      setNotice(tx(lang, { en: "The listing was updated.", zh: "刊登已更新。" }));
    } catch (reason: unknown) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setBusyId(null);
    }
  }

  async function saveFee(event: FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(feeInput.trim())) {
      setNotice("");
      setError(message(lang, "invalid_fee"));
      return;
    }
    const next = Number(feeInput);
    setSavingFee(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/marketplace/fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform_fee_twd: next }),
      });
      const body = (await response.json()) as { platform_fee_twd?: number; error?: string };
      if (!response.ok || typeof body.platform_fee_twd !== "number") throw new Error(body.error ?? "save_failed");
      setFee(body.platform_fee_twd);
      setFeeInput(String(body.platform_fee_twd));
      setNotice(
        tx(lang, {
          en: "The platform fee was saved. Orders already placed keep their original fee.",
          zh: "平台手續費已儲存。已成立的訂單仍使用原來的手續費。",
        }),
      );
    } catch (reason: unknown) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setSavingFee(false);
    }
  }

  function resetFilters() {
    setOrderId("");
    setStatus("");
    setBuyer("");
    setSeller("");
    setAmountMin("");
    setAmountMax("");
  }

  if (loading) {
    return <p className="site-wrap py-10 text-sm text-muted-foreground">{tx(lang, { en: "Loading…", zh: "載入中…" })}</p>;
  }

  return (
    <div className="site-wrap space-y-12 py-10">
      {error ? <p className="rounded-2xl border border-burgundy/30 bg-cream px-4 py-3 text-sm text-burgundy">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink">{notice}</p> : null}

      <section>
        <h2 className="text-3xl text-ink">{tx(lang, { en: "Platform fee", zh: "平台手續費" })}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {tx(lang, {
            en: "This amount is copied onto each new order. It is not added to the buyer total. Existing orders do not change.",
            zh: "這個金額會記在每一筆新訂單上，不會加進買家應付的總額。已成立的訂單不會改變。",
          })}
        </p>
        {role === "super_admin" ? (
          <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={saveFee}>
            <label className="text-sm font-semibold text-ink">
              {tx(lang, { en: "Fee per transaction (NT$)", zh: "每筆交易手續費（元）" })}
              <input
                className={fieldClass}
                inputMode="numeric"
                value={feeInput}
                onChange={(event) => setFeeInput(event.target.value)}
              />
            </label>
            <button className={primaryButton} type="submit" disabled={savingFee}>
              {savingFee ? tx(lang, { en: "Saving…", zh: "儲存中…" }) : tx(lang, { en: "Save fee", zh: "儲存手續費" })}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-ink">
            {tx(lang, { en: "Current fee", zh: "目前手續費" })}: {fee === null ? "—" : formatTwd(fee)}.{" "}
            {tx(lang, { en: "Only a super admin can change it.", zh: "只有超級管理員可以修改。" })}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-3xl text-ink">{tx(lang, { en: "Listings", zh: "刊登" })}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx(lang, { en: "Removing a listing hides it from the marketplace. The seller can still see it when editing.", zh: "下架後，刊登不會出現在市集。賣家編輯時仍看得到。" })}
        </p>
        {listings.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">{tx(lang, { en: "No listings yet.", zh: "目前沒有刊登。" })}</p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {listings.map((listing) => {
              const title = lang === "zh" ? listing.title_zh : listing.title_en;
              const next: ListingStatus = listing.status === "active" ? "removed" : "active";
              return (
                <article key={listing.id} className="rounded-2xl border border-border bg-cream p-4">
                  <div className="flex gap-4">
                    <MarketplacePhoto src={listing.image_url} alt={title} className="size-24 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-xl text-ink">{title}</h3>
                      <p className="mt-1 text-sm text-ink">
                        {tx(lang, { en: "Seller", zh: "賣家" })}: {listing.seller_name || "—"}
                      </p>
                      <p className="mt-1 text-sm text-ink">
                        {formatTwd(listing.price_twd)} · {tx(lang, stockLabel(listing.quantity))}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {listing.status === "active"
                          ? tx(lang, { en: "For sale", zh: "販售中" })
                          : tx(lang, { en: "Removed", zh: "已下架" })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${actionButton} mt-4`}
                    disabled={busyId === listing.id}
                    onClick={() => moderate(listing, next)}
                  >
                    {next === "removed"
                      ? tx(lang, { en: "Remove from sale", zh: "下架" })
                      : tx(lang, { en: "Put back for sale", zh: "重新上架" })}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl text-ink">{tx(lang, { en: "Transactions", zh: "交易" })}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {tx(lang, {
            en: "This list is read-only. An order waiting for payment confirmation for more than 7 days is highlighted.",
            zh: "這份清單只能查看。待確認付款超過 7 天的訂單會被標示出來。",
          })}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Order ID", zh: "訂單編號" })}
            <input className={fieldClass} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Status", zh: "狀態" })}
            <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value as "" | OrderStatus)}>
              <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
              {orderStatuses.map((item) => (
                <option key={item} value={item}>
                  {tx(lang, orderStatusLabel(item))}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Buyer", zh: "買家" })}
            <input className={fieldClass} value={buyer} onChange={(event) => setBuyer(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Seller", zh: "賣家" })}
            <input className={fieldClass} value={seller} onChange={(event) => setSeller(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Minimum amount", zh: "最低金額" })}
            <input className={fieldClass} inputMode="numeric" value={amountMin} onChange={(event) => setAmountMin(event.target.value)} />
          </label>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Maximum amount", zh: "最高金額" })}
            <input className={fieldClass} inputMode="numeric" value={amountMax} onChange={(event) => setAmountMax(event.target.value)} />
          </label>
        </div>
        <button type="button" className={`${actionButton} mt-4`} onClick={resetFilters}>
          {tx(lang, { en: "Reset filters", zh: "重設篩選" })}
        </button>
        {amountError ? (
          <p className="mt-4 text-sm text-burgundy">
            {tx(lang, { en: "Enter whole amounts, with the minimum at or below the maximum.", zh: "請輸入整數金額，最低金額不能高於最高金額。" })}
          </p>
        ) : (
          <p className="mt-4 text-sm text-ink">
            {tx(lang, { en: "Transactions", zh: "交易筆數" })}: {totals.count}
            {" · "}
            {tx(lang, { en: "Total amount", zh: "金額合計" })}: {formatTwd(totals.amount)}
            {" · "}
            {tx(lang, { en: "Platform fees", zh: "平台手續費合計" })}: {formatTwd(totals.fees)}
          </p>
        )}
        {visibleOrders.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">{tx(lang, { en: "No transactions match these filters.", zh: "沒有符合這些篩選的交易。" })}</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {visibleOrders.map((order) => {
              const late = isLatePayment(order.status, order.awaiting_payment_at);
              return (
                <article
                  key={order.id}
                  className={`rounded-2xl border bg-cream p-4 ${late ? "border-[#6b4e1e]" : "border-border"}`}
                >
                  <p className="font-mono text-xs break-all text-muted-foreground">{order.id}</p>
                  {late ? (
                    <p className="mt-2 text-sm font-semibold text-[#6b4e1e]">
                      {tx(lang, { en: "Waiting for payment confirmation for more than 7 days.", zh: "待確認付款已超過 7 天。" })}
                    </p>
                  ) : null}
                  <p className="mt-3 text-sm text-ink">
                    {tx(lang, { en: "Buyer", zh: "買家" })}: {order.buyer_name}
                    {" · "}
                    {tx(lang, { en: "Seller", zh: "賣家" })}: {order.seller_name}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-ink">
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {lang === "zh" ? item.title_zh : item.title_en} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-ink">
                    {tx(lang, { en: "Buyer total", zh: "買家合計" })} {formatTwd(order.total_twd)}
                    {" · "}
                    {tx(lang, { en: "Platform fee", zh: "平台手續費" })} {formatTwd(order.platform_fee_twd)}
                  </p>
                  <p className="mt-1 text-sm text-ink">
                    {tx(lang, { en: "Payment", zh: "付款" })}: {tx(lang, paymentStatusLabel(order.status))}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">{tx(lang, orderStatusLabel(order.status))}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(lang, taipeiDate(order.created_at))}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

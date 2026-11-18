"use client";

import { formatDate, tx, type Lang } from "@/lib/i18n";
import {
  advanceButtonLabel,
  formatTwd,
  nextOrderStatus,
  orderStatusLabel,
  paymentStatusLabel,
  type MarketplaceOrder,
  type OrderStatus,
} from "@/lib/marketplace-record";
import { useEffect, useMemo, useState } from "react";

const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";
const fieldClass =
  "mt-2 rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

const errorText: Record<string, { en: string; zh: string }> = {
  unauthorized: { en: "Sign in again to update the order.", zh: "請重新登入後再更新訂單。" },
  not_your_order: { en: "You can only update your own order.", zh: "只能更新自己的訂單。" },
  invalid_status_step: { en: "This order can only move one step forward.", zh: "訂單只能往前一個步驟。" },
  order_not_found: { en: "That order was not found.", zh: "找不到這筆訂單。" },
  order_snapshot_locked: { en: "This order can no longer be changed.", zh: "這筆訂單不能再修改。" },
  invalid_request: { en: "Check the order and try again.", zh: "請檢查訂單後再試一次。" },
  load_failed: { en: "Orders could not be loaded.", zh: "訂單無法載入。" },
  save_failed: { en: "The status could not be updated.", zh: "無法更新狀態。" },
};

const shippingStatuses: OrderStatus[] = ["payment_confirmed", "ready_to_ship", "shipped"];

function message(lang: Lang, code: string) {
  return tx(lang, errorText[code] ?? errorText.save_failed);
}

function taipeiParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { year: read("year"), month: read("month"), day: read("day") };
}

function monthKey(iso: string) {
  const parts = taipeiParts(iso);
  return `${parts.year}-${parts.month}`;
}

function currentMonth() {
  return monthKey(new Date().toISOString());
}

function csvCell(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function itemLine(order: MarketplaceOrder, lang: Lang) {
  return order.items
    .map((item) => `${lang === "zh" ? item.title_zh : item.title_en} x ${item.quantity}`)
    .join("; ");
}

function salesCsv(rows: MarketplaceOrder[], lang: Lang) {
  const header = ["order_id", "completed_at", "buyer_name", "items", "items_subtotal_twd", "delivery_fee_twd", "total_twd", "payment_status"];
  const lines = [
    header.join(","),
    ...rows.map((order) => {
      const completed = taipeiParts(order.updated_at);
      return [
        order.id,
        `${completed.year}-${completed.month}-${completed.day}`,
        order.buyer_name,
        itemLine(order, lang),
        String(order.items_subtotal_twd),
        String(order.delivery_fee_twd),
        String(order.total_twd),
        tx(lang, paymentStatusLabel(order.status)),
      ]
        .map(csvCell)
        .join(",");
    }),
  ];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function downloadCsv(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function OrderCard({
  lang,
  order,
  partyLabel,
  partyName,
  action,
  hint,
  busy,
  onAdvance,
}: {
  lang: Lang;
  order: MarketplaceOrder;
  partyLabel: { en: string; zh: string };
  partyName: string;
  action: "buyer" | "seller" | null;
  hint: string;
  busy: boolean;
  onAdvance: (order: MarketplaceOrder) => void;
}) {
  const next = nextOrderStatus(order.status);
  const button = action && next ? advanceButtonLabel(order.status) : null;
  const created = taipeiParts(order.created_at);
  return (
    <article className="rounded-2xl border border-border bg-cream p-4">
      <p className="font-mono text-xs break-all text-muted-foreground">{order.id}</p>
      <p className="mt-3 text-sm text-ink">
        <span className="font-semibold">{tx(lang, partyLabel)}</span> {partyName}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-ink">
        {order.items.map((item) => (
          <li key={`${item.title_en}-${item.unit_price_twd}-${item.quantity}`}>
            {lang === "zh" ? item.title_zh : item.title_en} × {item.quantity}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-ink">
        {tx(lang, { en: "Subtotal", zh: "商品小計" })} {formatTwd(order.items_subtotal_twd)}
        {" · "}
        {tx(lang, { en: "Total", zh: "總計" })} {formatTwd(order.total_twd)}
      </p>
      <p className="mt-2 text-sm text-ink">
        {tx(lang, { en: "Payment", zh: "付款" })}: {tx(lang, paymentStatusLabel(order.status))}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{tx(lang, orderStatusLabel(order.status))}</p>
      <p className="mt-1 text-sm text-muted-foreground">{formatDate(lang, `${created.year}-${created.month}-${created.day}`)}</p>
      {button ? (
        <button type="button" className={`${primaryButton} mt-4`} disabled={busy} onClick={() => onAdvance(order)}>
          {tx(lang, button)}
        </button>
      ) : hint ? (
        <p className="mt-4 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}

export function MarketplaceMe({ lang }: { lang: Lang }) {
  const [buyerOrders, setBuyerOrders] = useState<MarketplaceOrder[]>([]);
  const [sellerOrders, setSellerOrders] = useState<MarketplaceOrder[]>([]);
  const [month, setMonth] = useState(currentMonth);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/marketplace/me")
      .then(async (response) => {
        const body = (await response.json()) as { error?: string; buyer_orders?: MarketplaceOrder[]; seller_orders?: MarketplaceOrder[] };
        if (!response.ok) throw new Error(body.error ?? "load_failed");
        if (!active) return;
        setBuyerOrders(body.buyer_orders ?? []);
        setSellerOrders(body.seller_orders ?? []);
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

  const completedThisMonth = useMemo(
    () => sellerOrders.filter((order) => order.status === "completed" && monthKey(order.updated_at) === month),
    [sellerOrders, month],
  );
  const revenue = completedThisMonth.reduce((sum, order) => sum + order.items_subtotal_twd, 0);
  const pendingPayments = sellerOrders.filter((order) => order.status === "awaiting_payment");
  const toShip = sellerOrders.filter((order) => order.status === "payment_confirmed" || order.status === "ready_to_ship");
  const paymentQueue = sellerOrders.filter((order) => order.status === "placed" || order.status === "awaiting_payment");
  const shippingQueue = sellerOrders.filter((order) => shippingStatuses.includes(order.status));

  function replaceOrder(updated: MarketplaceOrder) {
    setBuyerOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
    setSellerOrders((current) => current.map((order) => (order.id === updated.id ? updated : order)));
  }

  async function advance(order: MarketplaceOrder, role: "buyer" | "seller") {
    const next = nextOrderStatus(order.status);
    if (!next) return;
    if (role === "buyer" && order.status !== "placed") return;
    if (role === "seller" && order.status === "placed") return;
    setBusyId(order.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/marketplace/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id, status: next }),
      });
      const body = (await response.json()) as MarketplaceOrder | { error?: string };
      if (!response.ok || !body || !("id" in body)) {
        const code = body && "error" in body && typeof body.error === "string" ? body.error : "save_failed";
        throw new Error(code);
      }
      replaceOrder(body);
      setNotice(tx(lang, { en: "The order moved one step forward.", zh: "訂單已往前一個步驟。" }));
    } catch (reason: unknown) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setBusyId(null);
    }
  }

  function exportSales() {
    downloadCsv(`marketplace_sales_${month}.csv`, salesCsv(completedThisMonth, lang));
  }

  if (loading) {
    return <p className="site-wrap py-10 text-sm text-muted-foreground">{tx(lang, { en: "Loading orders…", zh: "正在載入訂單…" })}</p>;
  }

  return (
    <div className="site-wrap space-y-12 py-10">
      {error ? <p className="rounded-2xl border border-burgundy/30 bg-cream px-4 py-3 text-sm text-burgundy">{error}</p> : null}
      {notice ? <p className="rounded-2xl border border-border bg-cream px-4 py-3 text-sm text-ink">{notice}</p> : null}

      <section>
        <h2 className="text-3xl text-ink">{tx(lang, { en: "My orders", zh: "我的訂單" })}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {tx(lang, {
            en: "After you pay the seller, mark the order as paid. The seller confirms it.",
            zh: "付款給賣家後，請標記為已付款。賣家會再確認。",
          })}
        </p>
        {buyerOrders.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">{tx(lang, { en: "You have no orders yet.", zh: "你還沒有訂單。" })}</p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {buyerOrders.map((order) => (
              <OrderCard
                key={order.id}
                lang={lang}
                order={order}
                partyLabel={{ en: "Seller", zh: "賣家" }}
                partyName={order.seller_name}
                action={order.status === "placed" ? "buyer" : null}
                hint={
                  order.status === "placed" || order.status === "completed"
                    ? ""
                    : tx(lang, { en: "The seller updates the next steps.", zh: "接下來由賣家更新狀態。" })
                }
                busy={busyId === order.id}
                onAdvance={(item) => advance(item, "buyer")}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl text-ink">{tx(lang, { en: "Seller dashboard", zh: "賣家看板" })}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {tx(lang, {
                en: "Revenue is the item subtotal of completed orders. Delivery is not included. Pending counts are current, not limited to the month.",
                zh: "收入是已完成訂單的商品小計，不含運費。待處理筆數是目前的數量，不受月份篩選。",
              })}
            </p>
          </div>
          <label className="text-sm font-semibold text-ink">
            {tx(lang, { en: "Month", zh: "月份" })}
            <input className={`${fieldClass} ml-3`} type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </label>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-border bg-cream p-4">
            <p className="text-sm text-muted-foreground">{tx(lang, { en: "Revenue", zh: "收入" })}</p>
            <p className="mt-2 text-2xl text-ink">{formatTwd(revenue)}</p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-4">
            <p className="text-sm text-muted-foreground">{tx(lang, { en: "Completed orders", zh: "已完成訂單" })}</p>
            <p className="mt-2 text-2xl text-ink">{completedThisMonth.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-4">
            <p className="text-sm text-muted-foreground">{tx(lang, { en: "Pending payments", zh: "待確認付款" })}</p>
            <p className="mt-2 text-2xl text-ink">{pendingPayments.length}</p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-4">
            <p className="text-sm text-muted-foreground">{tx(lang, { en: "Orders to ship", zh: "待出貨" })}</p>
            <p className="mt-2 text-2xl text-ink">{toShip.length}</p>
          </article>
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-ink">{tx(lang, { en: "Pending payments", zh: "待確認付款" })}</h2>
        {paymentQueue.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{tx(lang, { en: "No payments are waiting.", zh: "目前沒有待確認的付款。" })}</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {paymentQueue.map((order) => (
              <OrderCard
                key={order.id}
                lang={lang}
                order={order}
                partyLabel={{ en: "Buyer", zh: "買家" }}
                partyName={order.buyer_name}
                action={order.status === "awaiting_payment" ? "seller" : null}
                hint={
                  order.status === "placed"
                    ? tx(lang, { en: "The buyer has not reported payment yet.", zh: "買家尚未回報付款。" })
                    : ""
                }
                busy={busyId === order.id}
                onAdvance={(item) => advance(item, "seller")}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl text-ink">{tx(lang, { en: "Pending shipments", zh: "待出貨" })}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tx(lang, { en: "Confirm packing, shipment, then completion. You cannot skip a step.", zh: "依序確認備貨、出貨，然後完成。不能跳過步驟。" })}
        </p>
        {shippingQueue.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{tx(lang, { en: "Nothing is waiting to ship.", zh: "目前沒有待出貨的訂單。" })}</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {shippingQueue.map((order) => (
              <OrderCard
                key={order.id}
                lang={lang}
                order={order}
                partyLabel={{ en: "Buyer", zh: "買家" }}
                partyName={order.buyer_name}
                action="seller"
                hint=""
                busy={busyId === order.id}
                onAdvance={(item) => advance(item, "seller")}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl text-ink">{tx(lang, { en: "Completed orders", zh: "已完成的訂單" })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tx(lang, { en: "Sales history for the selected month.", zh: "所選月份的銷售紀錄。" })}
            </p>
          </div>
          <button type="button" className={primaryButton} onClick={exportSales}>
            {tx(lang, { en: "Export CSV", zh: "匯出 CSV" })}
          </button>
        </div>
        {completedThisMonth.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{tx(lang, { en: "No completed orders in this month.", zh: "這個月沒有已完成的訂單。" })}</p>
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {completedThisMonth.map((order) => (
              <OrderCard
                key={order.id}
                lang={lang}
                order={order}
                partyLabel={{ en: "Buyer", zh: "買家" }}
                partyName={order.buyer_name}
                action={null}
                hint=""
                busy={false}
                onAdvance={() => undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

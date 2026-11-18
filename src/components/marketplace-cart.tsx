"use client";

import { MarketplacePhoto } from "@/components/marketplace-photo";
import { TextLink } from "@/components/site-links";
import { readCart, writeCart } from "@/lib/marketplace-cart";
import { deliveryFee, formatTwd, type ListingQuote } from "@/lib/marketplace-record";
import { tx, withLang, type Lang } from "@/lib/i18n";
import { useEffect, useMemo, useState } from "react";

const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";
const stepButton =
  "inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-lg text-ink hover:border-burgundy disabled:opacity-40";
const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

const errorText: Record<string, { en: string; zh: string }> = {
  unauthorized: { en: "Sign in again to place the order.", zh: "請重新登入後再下單。" },
  cannot_buy_own_listing: { en: "You cannot buy your own listing. Remove it from the cart.", zh: "不能購買自己的刊登，請先從購物車移除。" },
  buyer_not_allowed: { en: "This account cannot place an order.", zh: "此帳號不能下單。" },
  seller_not_allowed: { en: "That seller cannot take an order.", zh: "這位賣家目前不能接單。" },
  invalid_delivery: { en: "Choose pickup or home delivery.", zh: "請選擇面交或宅配。" },
  empty_order: { en: "Your cart is empty.", zh: "購物車是空的。" },
  invalid_item: { en: "Check the quantities and try again.", zh: "請檢查數量後再試一次。" },
  duplicate_listing: { en: "Each book can appear only once.", zh: "同一本書只能出現一次。" },
  listing_not_available: { en: "A listing in the cart is no longer for sale.", zh: "購物車裡有一則刊登已不再販售。" },
  insufficient_stock: { en: "There is not enough stock for that quantity.", zh: "庫存不足，無法訂購這個數量。" },
  settings_missing: { en: "Orders are unavailable right now.", zh: "目前無法下單。" },
  display_name_required: { en: "Add the name the seller will see.", zh: "請填寫賣家會看到的名稱。" },
  invalid_phone: { en: "The phone number must be 40 characters or fewer.", zh: "電話最多 40 字。" },
  invalid_request: { en: "Check the cart and try again.", zh: "請檢查購物車後再試一次。" },
  load_failed: { en: "The cart could not be loaded.", zh: "購物車無法載入。" },
  save_failed: { en: "The order could not be placed.", zh: "訂單無法成立。" },
};

type DeliveryMode = "pickup" | "home";

function message(lang: Lang, code: string) {
  return tx(lang, errorText[code] ?? errorText.save_failed);
}

export function MarketplaceCart({ lang }: { lang: Lang }) {
  const [lines, setLines] = useState<{ listingId: string; quantity: number }[]>([]);
  const [quotes, setQuotes] = useState<ListingQuote[]>([]);
  const [delivery, setDelivery] = useState<Record<string, DeliveryMode>>({});
  const [needsProfile, setNeedsProfile] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLines(readCart());
    fetch("/api/marketplace/orders")
      .then((response) => response.json())
      .then((body: { signed_in?: boolean; needs_profile?: boolean; user_id?: string }) => {
        setSignedIn(body.signed_in === true);
        setNeedsProfile(body.needs_profile !== false);
        setUserId(typeof body.user_id === "string" ? body.user_id : null);
      })
      .catch(() => setError(message(lang, "load_failed")));
  }, [lang]);

  useEffect(() => {
    const ids = lines.map((line) => line.listingId);
    if (!ids.length) {
      setQuotes([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/marketplace/listings?ids=${ids.join(",")}`)
      .then(async (response) => {
        const body = (await response.json()) as ListingQuote[] | { error?: string };
        if (!response.ok || !Array.isArray(body)) throw new Error("load_failed");
        if (active) setQuotes(body);
      })
      .catch(() => {
        if (active) setError(message(lang, "load_failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lines, lang]);

  const groups = useMemo(() => {
    const bySeller = new Map<string, { sellerId: string; sellerName: string; lines: { quote: ListingQuote; quantity: number }[] }>();
    for (const line of lines) {
      const quote = quotes.find((item) => item.id === line.listingId);
      if (!quote) continue;
      const group = bySeller.get(quote.seller_id) ?? {
        sellerId: quote.seller_id,
        sellerName: quote.seller_name,
        lines: [],
      };
      const quantity = Math.min(line.quantity, Math.max(quote.quantity, 0));
      group.lines.push({ quote, quantity: quantity > 0 ? quantity : line.quantity });
      bySeller.set(quote.seller_id, group);
    }
    return [...bySeller.values()];
  }, [lines, quotes]);

  function updateQuantity(listingId: string, quantity: number) {
    const next = lines.flatMap((line) => {
      if (line.listingId !== listingId) return [line];
      if (quantity < 1) return [];
      return [{ listingId, quantity }];
    });
    setLines(next);
    writeCart(next);
  }

  function removeLine(listingId: string) {
    updateQuantity(listingId, 0);
  }

  const subtotal = groups.reduce(
    (sum, group) => sum + group.lines.reduce((lineSum, line) => lineSum + line.quote.price_twd * Math.min(line.quantity, line.quote.quantity), 0),
    0,
  );
  const fees = groups.reduce((sum, group) => sum + deliveryFee(delivery[group.sellerId] ?? "pickup"), 0);

  async function placeOrder() {
    setPlacing(true);
    setError("");
    setNotice("");
    const payload = {
      display_name: displayName,
      phone,
      groups: groups
        .filter((group) => group.sellerId !== userId)
        .map((group) => ({
          seller_id: group.sellerId,
          delivery_mode: delivery[group.sellerId] ?? "pickup",
          items: group.lines
            .filter((line) => line.quote.status === "active" && line.quote.quantity > 0)
            .map((line) => ({
              listing_id: line.quote.id,
              quantity: Math.min(line.quantity, line.quote.quantity),
            })),
        }))
        .filter((group) => group.items.length > 0),
    };
    if (groups.some((group) => group.sellerId === userId)) {
      setError(message(lang, "cannot_buy_own_listing"));
      setPlacing(false);
      return;
    }
    if (!payload.groups.length) {
      setError(message(lang, "listing_not_available"));
      setPlacing(false);
      return;
    }
    try {
      const response = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        placed?: { order_id: string; seller_id: string }[];
        failed?: { seller_id: string; error: string }[];
      } | null;
      if (!response.ok) {
        setError(message(lang, body?.error ?? "save_failed"));
        return;
      }
      const placedIds = new Set((body?.placed ?? []).map((order) => order.seller_id));
      const bought = new Set(
        groups.filter((group) => placedIds.has(group.sellerId)).flatMap((group) => group.lines.map((line) => line.quote.id)),
      );
      const next = lines.filter((line) => !bought.has(line.listingId));
      setLines(next);
      writeCart(next);
      const failed = body?.failed ?? [];
      const placedCount = body?.placed?.length ?? 0;
      setNotice(
        failed.length
          ? tx(lang, {
              en: `Placed ${placedCount} order(s). One seller could not be ordered: ${message(lang, failed[0].error)}`,
              zh: `已成立 ${placedCount} 筆訂單。有一位賣家無法下單：${message(lang, failed[0].error)}`,
            })
          : tx(lang, {
              en: placedCount === 1 ? "Order placed." : `${placedCount} orders placed, one for each seller.`,
              zh: placedCount === 1 ? "訂單已成立。" : `已成立 ${placedCount} 筆訂單，每位賣家一筆。`,
            }),
      );
    } catch {
      setError(message(lang, "save_failed"));
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="site-wrap max-w-3xl py-14">
      <TextLink href={withLang(lang, "/marketplace")}>{tx(lang, { en: "Back to the marketplace", zh: "返回教材市集" })}</TextLink>
      {loading ? <p className="mt-6 text-sm text-muted-foreground">{tx(lang, { en: "Loading the cart…", zh: "正在載入購物車…" })}</p> : null}
      {!loading && lines.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{tx(lang, { en: "Your cart is empty.", zh: "購物車是空的。" })}</p>
      ) : null}
      <div className="mt-6 grid gap-6">
        {groups.map((group) => {
          const mode = delivery[group.sellerId] ?? "pickup";
          const groupSubtotal = group.lines.reduce((sum, line) => sum + line.quote.price_twd * Math.min(line.quantity, Math.max(line.quote.quantity, 0)), 0);
          const own = userId === group.sellerId;
          return (
            <article key={group.sellerId} className="rounded-2xl border border-border bg-cream p-5">
              <h2 className="text-2xl text-ink">{group.sellerName || tx(lang, { en: "Seller", zh: "賣家" })}</h2>
              {own ? (
                <p className="mt-2 text-sm text-burgundy">{message(lang, "cannot_buy_own_listing")}</p>
              ) : null}
              <ul className="mt-4 grid gap-4">
                {group.lines.map((line) => {
                  const title = lang === "zh" ? line.quote.title_zh : line.quote.title_en;
                  const available = line.quote.status === "active" ? line.quote.quantity : 0;
                  const shown = Math.min(line.quantity, Math.max(available, 1));
                  return (
                    <li key={line.quote.id} className="flex gap-4">
                      <MarketplacePhoto src={line.quote.image_url} alt={title} className="h-20 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{title}</p>
                        <p className="mt-1 text-sm text-ink">{formatTwd(line.quote.price_twd)}</p>
                        {available < 1 ? (
                          <p className="mt-2 text-sm text-burgundy">{message(lang, line.quote.status === "active" ? "insufficient_stock" : "listing_not_available")}</p>
                        ) : (
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" className={stepButton} disabled={shown <= 1} onClick={() => updateQuantity(line.quote.id, shown - 1)} aria-label={tx(lang, { en: "Decrease quantity", zh: "減少數量" })}>
                              −
                            </button>
                            <span className="min-w-6 text-center text-ink">{shown}</span>
                            <button type="button" className={stepButton} disabled={shown >= available} onClick={() => updateQuantity(line.quote.id, shown + 1)} aria-label={tx(lang, { en: "Increase quantity", zh: "增加數量" })}>
                              +
                            </button>
                          </div>
                        )}
                        <button type="button" className="mt-2 text-sm text-ink underline underline-offset-4" onClick={() => removeLine(line.quote.id)}>
                          {tx(lang, { en: "Remove", zh: "移除" })}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <fieldset className="mt-4 grid gap-2" disabled={own}>
                <legend className="text-sm font-semibold text-ink">{tx(lang, { en: "Delivery", zh: "運送" })}</legend>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="radio" name={`delivery-${group.sellerId}`} checked={mode === "pickup"} onChange={() => setDelivery((current) => ({ ...current, [group.sellerId]: "pickup" }))} />
                  {tx(lang, { en: "Pickup, NT$0", zh: "面交，0 元" })}
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="radio" name={`delivery-${group.sellerId}`} checked={mode === "home"} onChange={() => setDelivery((current) => ({ ...current, [group.sellerId]: "home" }))} />
                  {tx(lang, { en: "Home delivery, NT$80", zh: "宅配，80 元" })}
                </label>
              </fieldset>
              <p className="mt-3 text-sm text-ink">
                {tx(lang, { en: "Subtotal", zh: "小計" })} {formatTwd(groupSubtotal)}
                {" · "}
                {tx(lang, { en: "Delivery", zh: "運費" })} {formatTwd(deliveryFee(mode))}
                {" · "}
                {tx(lang, { en: "Total", zh: "總計" })} {formatTwd(groupSubtotal + deliveryFee(mode))}
              </p>
            </article>
          );
        })}
      </div>
      {groups.length > 1 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {tx(lang, { en: "Each seller becomes a separate order.", zh: "每位賣家會各自成立一筆訂單。" })}
        </p>
      ) : null}
      {groups.length > 0 ? (
        <p className="mt-4 text-lg text-ink">
          {tx(lang, { en: "Total", zh: "總計" })} {formatTwd(subtotal + fees)}
        </p>
      ) : null}
      {signedIn && needsProfile && groups.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">
            {tx(lang, { en: "Name shown to the seller", zh: "顯示給賣家的名稱" })}
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={200} className={fieldClass} />
          </label>
          <label className="block text-sm font-semibold text-ink">
            {tx(lang, { en: "Phone (optional)", zh: "電話（選填）" })}
            <input value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} className={fieldClass} />
          </label>
        </div>
      ) : null}
      {!signedIn && groups.length > 0 ? (
        <p className="mt-4 text-sm text-ink">
          <TextLink href={withLang(lang, "/login")}>{tx(lang, { en: "Sign in", zh: "登入" })}</TextLink>
          {tx(lang, { en: ", then open the cart again to place the order.", zh: "，然後重新開啟購物車再下單。" })}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 text-sm text-[#1d4f86]" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-burgundy" role="alert">
          {error}
        </p>
      ) : null}
      {signedIn && groups.length > 0 ? (
        <button type="button" className={`${primaryButton} mt-6`} disabled={placing} onClick={placeOrder}>
          {placing ? tx(lang, { en: "Placing the order…", zh: "正在下單…" }) : tx(lang, { en: "Place order", zh: "下單" })}
        </button>
      ) : null}
    </section>
  );
}

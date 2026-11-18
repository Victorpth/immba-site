"use client";

import { addToCart } from "@/lib/marketplace-cart";
import { tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";
import { useState } from "react";

const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";
const stepButton =
  "inline-flex size-11 items-center justify-center rounded-full border border-border bg-white text-lg text-ink hover:border-burgundy disabled:opacity-40";

export function MarketplacePurchase({
  lang,
  listingId,
  stock,
  ownListing,
}: {
  lang: Lang;
  listingId: string;
  stock: number;
  ownListing: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const capped = Math.min(stock, Math.max(1, quantity));

  if (ownListing) {
    return (
      <p className="mt-6 text-sm text-burgundy" role="status">
        {tx(lang, { en: "You cannot buy your own listing.", zh: "不能購買自己的刊登。" })}
      </p>
    );
  }

  if (stock < 1) {
    return (
      <p className="mt-6 text-sm text-muted-foreground" role="status">
        {tx(lang, { en: "Sold out.", zh: "已售完。" })}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-semibold text-ink">{tx(lang, { en: "Quantity", zh: "數量" })}</p>
      <div className="mt-2 flex items-center gap-3">
        <button type="button" className={stepButton} disabled={capped <= 1} onClick={() => setQuantity(capped - 1)} aria-label={tx(lang, { en: "Decrease quantity", zh: "減少數量" })}>
          −
        </button>
        <span className="min-w-8 text-center text-lg text-ink">{capped}</span>
        <button type="button" className={stepButton} disabled={capped >= stock} onClick={() => setQuantity(capped + 1)} aria-label={tx(lang, { en: "Increase quantity", zh: "增加數量" })}>
          +
        </button>
        <span className="text-sm text-muted-foreground">
          {tx(lang, { en: `${stock} available`, zh: `可購 ${stock}` })}
        </span>
      </div>
      <button
        type="button"
        className={`${primaryButton} mt-4`}
        onClick={() => {
          addToCart(listingId, capped, stock);
          setAdded(true);
        }}
      >
        {tx(lang, { en: "Add to cart", zh: "加入購物車" })}
      </button>
      {added ? (
        <p className="mt-4 text-sm text-[#1d4f86]" role="status">
          {tx(lang, { en: "Added to cart.", zh: "已加入購物車。" })}{" "}
          <Link href={withLang(lang, "/marketplace/cart")} className="underline underline-offset-4">
            {tx(lang, { en: "View cart", zh: "查看購物車" })}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

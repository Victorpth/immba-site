"use client";

import { MarketplacePhoto } from "@/components/marketplace-photo";
import { TextLink } from "@/components/site-links";
import { tx, withLang, type Lang } from "@/lib/i18n";
import {
  categoryLabel,
  formatTwd,
  listingCategories,
  stockLabel,
  type ListingCategory,
  type ListingRecord,
} from "@/lib/marketplace-record";
import Link from "next/link";
import { useMemo, useState } from "react";

const actionButton =
  "inline-flex h-10 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-ink hover:border-burgundy";
const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

function stockClass(quantity: number) {
  if (quantity <= 0) return "border-border text-muted-foreground";
  if (quantity === 1) return "border-[#6b4e1e] text-[#6b4e1e]";
  return "border-border text-ink";
}

function priceBound(value: string) {
  if (!value.trim()) return null;
  if (!/^\d+$/.test(value.trim())) return undefined;
  return Number(value);
}

function matchesKeyword(listing: ListingRecord, needle: string) {
  if (!needle) return true;
  const haystack = [listing.title_en, listing.title_zh, listing.description_en, listing.description_zh, listing.course_name ?? ""]
    .join("\n")
    .toLowerCase();
  return haystack.includes(needle);
}

export function MarketplaceList({
  lang,
  listings,
  userId,
}: {
  lang: Lang;
  listings: ListingRecord[];
  userId: string | null;
}) {
  const [category, setCategory] = useState<"" | ListingCategory>("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [availability, setAvailability] = useState<"" | "available" | "sold_out">("");

  const min = priceBound(minPrice);
  const max = priceBound(maxPrice);
  const priceError = min === undefined || max === undefined || (min !== null && max !== null && min > max);

  const visible = useMemo(() => {
    if (priceError) return [];
    const needle = keyword.trim().toLowerCase();
    return listings.filter((listing) => {
      if (category && listing.category !== category) return false;
      if (min !== null && listing.price_twd < min) return false;
      if (max !== null && listing.price_twd > max) return false;
      if (!matchesKeyword(listing, needle)) return false;
      if (availability === "available" && listing.quantity < 1) return false;
      if (availability === "sold_out" && listing.quantity > 0) return false;
      return true;
    });
  }, [listings, category, min, max, keyword, availability, priceError]);

  function reset() {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setKeyword("");
    setAvailability("");
  }

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold text-ink">
          {tx(lang, { en: "Category", zh: "類別" })}
          <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value as "" | ListingCategory)}>
            <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
            {listingCategories.map((item) => (
              <option key={item} value={item}>
                {tx(lang, categoryLabel(item))}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-ink">
          {tx(lang, { en: "Minimum price", zh: "最低價格" })}
          <input className={fieldClass} inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-ink">
          {tx(lang, { en: "Maximum price", zh: "最高價格" })}
          <input className={fieldClass} inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-ink">
          {tx(lang, { en: "Keyword", zh: "關鍵字" })}
          <input className={fieldClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-ink">
          {tx(lang, { en: "Availability", zh: "庫存狀態" })}
          <select
            className={fieldClass}
            value={availability}
            onChange={(event) => setAvailability(event.target.value as "" | "available" | "sold_out")}
          >
            <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
            <option value="available">{tx(lang, { en: "In stock", zh: "有庫存" })}</option>
            <option value="sold_out">{tx(lang, { en: "Sold out", zh: "已售完" })}</option>
          </select>
        </label>
      </div>
      <button type="button" className={`${actionButton} mt-4`} onClick={reset}>
        {tx(lang, { en: "Reset", zh: "重設" })}
      </button>
      {priceError ? (
        <p className="mt-4 text-sm text-burgundy">
          {tx(lang, {
            en: "Enter whole prices, with the minimum at or below the maximum.",
            zh: "請輸入整數價格，最低價格不能高於最高價格。",
          })}
        </p>
      ) : visible.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {tx(lang, { en: "No listings match these filters.", zh: "沒有符合這些篩選的刊登。" })}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((listing) => {
            const itemTitle = lang === "zh" ? listing.title_zh : listing.title_en;
            return (
              <article key={listing.id} className="rounded-2xl border border-border bg-cream p-4">
                <Link href={withLang(lang, `/marketplace/${listing.id}`)} className="block">
                  <MarketplacePhoto
                    src={listing.image_url}
                    alt={itemTitle}
                    className="block aspect-[4/3] w-full rounded-xl object-cover"
                  />
                  <h3 className="mt-4 text-xl text-ink">{itemTitle}</h3>
                  <p className="mt-2 text-sm font-semibold text-ink">{formatTwd(listing.price_twd)}</p>
                  <p className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stockClass(listing.quantity)}`}>
                    {tx(lang, stockLabel(listing.quantity))}
                  </p>
                </Link>
                {userId === listing.seller_id ? (
                  <div className="mt-4">
                    <TextLink href={withLang(lang, `/marketplace/${listing.id}/edit`)}>
                      {tx(lang, { en: "Edit", zh: "編輯" })}
                    </TextLink>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

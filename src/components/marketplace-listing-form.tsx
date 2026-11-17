"use client";

import { MarketplacePhoto } from "@/components/marketplace-photo";
import { TextLink } from "@/components/site-links";
import {
  categoryLabel,
  conditionLabel,
  listingCategories,
  listingConditions,
  type ListingRecord,
} from "@/lib/marketplace-record";
import { saveListing, type ListingFormState } from "@/lib/marketplace-actions";
import { tx, withLang, type Lang } from "@/lib/i18n";
import { useActionState, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";
const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";

const errorText: Record<string, { en: string; zh: string }> = {
  unauthorized: { en: "Sign in again to publish a listing.", zh: "請重新登入後再刊登。" },
  title_required: { en: "Add an English title and a Chinese title, each up to 200 characters.", zh: "請填寫英文標題與中文標題，各不超過 200 字。" },
  description_too_long: { en: "Each description must be 4,000 characters or fewer.", zh: "每段說明最多 4,000 字。" },
  invalid_price: { en: "Enter a whole price in TWD, from 0 upward.", zh: "請輸入 0 以上的整數新台幣價格。" },
  invalid_quantity: { en: "Enter a whole number of copies still in stock, from 0 upward.", zh: "請輸入 0 以上的整數庫存。" },
  invalid_condition: { en: "Choose the condition.", zh: "請選擇物品狀況。" },
  invalid_category: { en: "Choose a category.", zh: "請選擇分類。" },
  invalid_course: { en: "The course name must be 200 characters or fewer.", zh: "課程名稱最多 200 字。" },
  display_name_required: { en: "Add the name buyers will see, up to 200 characters.", zh: "請填寫買家會看到的名稱，最多 200 字。" },
  invalid_phone: { en: "The phone number must be 40 characters or fewer.", zh: "電話最多 40 字。" },
  photo_type: { en: "Use a JPG, PNG, or WebP photo.", zh: "請使用 JPG、PNG 或 WebP 照片。" },
  photo_too_large: { en: "The photo must be smaller than 5 MB.", zh: "照片必須小於 5 MB。" },
  photo_failed: { en: "The photo could not be saved.", zh: "照片無法儲存。" },
  not_found: { en: "That listing is not yours, or it no longer exists.", zh: "這不是你的刊登，或刊登已不存在。" },
  invalid_request: { en: "Check the form and try again.", zh: "請檢查表單後再試一次。" },
  save_failed: { en: "The listing could not be saved.", zh: "刊登無法儲存。" },
};

const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const photoLimit = 5 * 1024 * 1024;

function message(lang: Lang, code: string) {
  return tx(lang, errorText[code] ?? { en: "Something went wrong.", zh: "發生錯誤。" });
}

export function MarketplaceListingForm({
  lang,
  mode,
  listing,
  needsProfile,
}: {
  lang: Lang;
  mode: "create" | "update";
  listing: ListingRecord | null;
  needsProfile: boolean;
}) {
  const [state, action, pending] = useActionState<ListingFormState, FormData>(saveListing, {});
  const [preview, setPreview] = useState("");
  const [photoError, setPhotoError] = useState("");

  function choosePhoto(file: File | null) {
    if (!file) {
      setPreview("");
      return;
    }
    const extensionOk = /\.(jpe?g|png|webp)$/i.test(file.name);
    const mimeOk = file.type === "" || photoTypes.includes(file.type);
    if (!extensionOk || !mimeOk || file.size > photoLimit) {
      setPreview("");
      setPhotoError(message(lang, file.size > photoLimit ? "photo_too_large" : "photo_type"));
      return;
    }
    setPhotoError("");
    setPreview(URL.createObjectURL(file));
  }

  const error = photoError || (state.error ? message(lang, state.error) : "");
  const notice =
    state.message === "removed"
      ? tx(lang, {
          en: "This listing is off the public page. Choose For sale and save to put it back.",
          zh: "這則刊登已從公開頁面下架。選「販售中」再儲存即可重新上架。",
        })
      : "";

  return (
    <form action={action} className="site-wrap max-w-3xl py-14">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="mode" value={mode} />
      {listing ? <input type="hidden" name="listing_id" value={listing.id} /> : null}
      <TextLink href={withLang(lang, "/marketplace")}>{tx(lang, { en: "Back to the marketplace", zh: "返回教材市集" })}</TextLink>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {needsProfile ? (
          <>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Name shown to buyers", zh: "顯示給買家的名稱" })}
              <input name="display_name" required maxLength={200} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Phone (optional)", zh: "電話（選填）" })}
              <input name="phone" maxLength={40} className={fieldClass} />
            </label>
          </>
        ) : null}
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "English title", zh: "英文標題" })}
          <input name="title_en" required maxLength={200} defaultValue={listing?.title_en ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Chinese title", zh: "中文標題" })}
          <input name="title_zh" required maxLength={200} defaultValue={listing?.title_zh ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          {tx(lang, { en: "English description", zh: "英文說明" })}
          <textarea name="description_en" rows={4} maxLength={4000} defaultValue={listing?.description_en ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          {tx(lang, { en: "Chinese description", zh: "中文說明" })}
          <textarea name="description_zh" rows={4} maxLength={4000} defaultValue={listing?.description_zh ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Price (TWD)", zh: "價格（新台幣）" })}
          <input name="price_twd" type="number" required min={0} step={1} defaultValue={listing?.price_twd ?? ""} className={fieldClass} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Quantity in stock", zh: "庫存數量" })}
          <input name="quantity" type="number" required min={0} step={1} defaultValue={listing?.quantity ?? 1} className={fieldClass} />
          <span className="mt-2 block text-xs font-normal text-muted-foreground">
            {tx(lang, { en: "0 shows Sold out. 1 shows Low stock.", zh: "0 顯示已售完。1 顯示庫存偏低。" })}
          </span>
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Condition", zh: "物品狀況" })}
          <select name="condition" defaultValue={listing?.condition ?? "good"} className={fieldClass}>
            {listingConditions.map((condition) => (
              <option key={condition} value={condition}>
                {tx(lang, conditionLabel(condition))}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Category", zh: "分類" })}
          <select name="category" defaultValue={listing?.category ?? "book"} className={fieldClass}>
            {listingCategories.map((category) => (
              <option key={category} value={category}>
                {tx(lang, categoryLabel(category))}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          {tx(lang, { en: "Course name (optional)", zh: "課程名稱（選填）" })}
          <input name="course_name" maxLength={200} defaultValue={listing?.course_name ?? ""} className={fieldClass} />
        </label>
        {mode === "update" ? (
          <label className="block text-sm font-semibold text-ink">
            {tx(lang, { en: "Listing status", zh: "刊登狀態" })}
            <select name="status" defaultValue={listing?.status ?? "active"} className={fieldClass}>
              <option value="active">{tx(lang, { en: "For sale", zh: "販售中" })}</option>
              <option value="removed">{tx(lang, { en: "Removed", zh: "已下架" })}</option>
            </select>
          </label>
        ) : null}
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Photo (JPG, PNG, or WebP, up to 5 MB)", zh: "照片（JPG、PNG 或 WebP，5 MB 以內）" })}
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)}
            className={fieldClass}
          />
        </label>
        {listing?.image_url ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
            <input name="remove_photo" type="checkbox" value="1" />
            {tx(lang, { en: "Remove the current photo", zh: "移除目前的照片" })}
          </label>
        ) : null}
        {preview || listing?.image_url ? (
          <MarketplacePhoto
            src={preview || listing?.image_url || null}
            alt={tx(lang, { en: "Listing photo", zh: "刊登照片" })}
            className="h-40 w-32 rounded-2xl object-cover"
          />
        ) : null}
      </div>
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
      <button type="submit" disabled={pending} className={`${primaryButton} mt-6`}>
        {pending
          ? tx(lang, { en: "Saving…", zh: "儲存中…" })
          : tx(lang, { en: "Save listing", zh: "儲存刊登" })}
      </button>
    </form>
  );
}

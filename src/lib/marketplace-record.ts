import type { Bi } from "@/lib/i18n";

export const listingConditions = ["new", "like_new", "good", "fair"] as const;
export const listingCategories = ["book", "course_material", "other"] as const;
export const listingStatuses = ["active", "removed"] as const;

export type ListingCondition = (typeof listingConditions)[number];
export type ListingCategory = (typeof listingCategories)[number];
export type ListingStatus = (typeof listingStatuses)[number];

export type ListingRecord = {
  id: string;
  seller_id: string;
  title_en: string;
  title_zh: string;
  description_en: string;
  description_zh: string;
  price_twd: number;
  quantity: number;
  condition: ListingCondition;
  category: ListingCategory;
  course_name: string | null;
  status: ListingStatus;
  image_url: string | null;
};

export type ListingWrite = {
  title_en: string;
  title_zh: string;
  description_en: string;
  description_zh: string;
  price_twd: number;
  quantity: number;
  condition: ListingCondition;
  category: ListingCategory;
  course_name: string | null;
  status: ListingStatus;
};

export type SellerProfileInput = {
  display_name: string;
  phone: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isListingId(value: string) {
  return uuidPattern.test(value);
}

export function stockLabel(quantity: number): Bi {
  if (quantity <= 0) return { en: "Sold out", zh: "已售完" };
  if (quantity === 1) return { en: "Low stock", zh: "庫存偏低" };
  return { en: `${quantity} in stock`, zh: `庫存 ${quantity}` };
}

export function conditionLabel(condition: ListingCondition): Bi {
  if (condition === "new") return { en: "New", zh: "全新" };
  if (condition === "like_new") return { en: "Like new", zh: "近全新" };
  if (condition === "good") return { en: "Good", zh: "良好" };
  return { en: "Fair", zh: "尚可" };
}

export function categoryLabel(category: ListingCategory): Bi {
  if (category === "book") return { en: "Book", zh: "書籍" };
  if (category === "course_material") return { en: "Course material", zh: "上課教材" };
  return { en: "Other", zh: "其他" };
}

function chars(value: string) {
  return Array.from(value).length;
}

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function wholeNumber(value: string) {
  if (!/^\d{1,10}$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > 2147483647) return null;
  return parsed;
}

function oneOf<T extends string>(value: string, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

export function parseListingFields(
  form: FormData,
  mode: "create" | "update",
): { ok: true; value: ListingWrite; profile: SellerProfileInput | null; removePhoto: boolean } | { ok: false; error: string } {
  const titleEn = field(form, "title_en");
  const titleZh = field(form, "title_zh");
  if (chars(titleEn) < 1 || chars(titleEn) > 200 || chars(titleZh) < 1 || chars(titleZh) > 200) {
    return { ok: false, error: "title_required" };
  }

  const descriptionEn = field(form, "description_en");
  const descriptionZh = field(form, "description_zh");
  if (chars(descriptionEn) > 4000 || chars(descriptionZh) > 4000) {
    return { ok: false, error: "description_too_long" };
  }

  const price = wholeNumber(field(form, "price_twd"));
  if (price === null) return { ok: false, error: "invalid_price" };
  const quantity = wholeNumber(field(form, "quantity"));
  if (quantity === null) return { ok: false, error: "invalid_quantity" };

  const condition = oneOf(field(form, "condition"), listingConditions);
  if (!condition) return { ok: false, error: "invalid_condition" };
  const category = oneOf(field(form, "category"), listingCategories);
  if (!category) return { ok: false, error: "invalid_category" };

  const courseName = field(form, "course_name");
  if (chars(courseName) > 200) return { ok: false, error: "invalid_course" };

  const requestedStatus = oneOf(field(form, "status"), listingStatuses);
  if (mode === "update" && field(form, "status") && !requestedStatus) {
    return { ok: false, error: "invalid_request" };
  }

  let profile: SellerProfileInput | null = null;
  if (mode === "create") {
    const displayName = field(form, "display_name");
    const phone = field(form, "phone");
    if (chars(phone) > 40) return { ok: false, error: "invalid_phone" };
    if (displayName || phone) {
      if (chars(displayName) < 1 || chars(displayName) > 200) return { ok: false, error: "display_name_required" };
      profile = { display_name: displayName, phone: phone || null };
    }
  }

  return {
    ok: true,
    value: {
      title_en: titleEn,
      title_zh: titleZh,
      description_en: descriptionEn,
      description_zh: descriptionZh,
      price_twd: price,
      quantity,
      condition,
      category,
      course_name: courseName || null,
      status: mode === "create" ? "active" : requestedStatus ?? "active",
    },
    profile,
    removePhoto: form.get("remove_photo") === "1",
  };
}

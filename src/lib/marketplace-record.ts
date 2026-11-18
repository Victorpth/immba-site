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

export type ListingQuote = ListingRecord & { seller_name: string };

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

export function formatTwd(amount: number) {
  return `NT$${amount.toLocaleString("en-US")}`;
}

export function deliveryFee(mode: "pickup" | "home") {
  return mode === "home" ? 80 : 0;
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

export type CheckoutItem = { listing_id: string; quantity: number };
export type CheckoutGroup = {
  seller_id: string;
  delivery_mode: "pickup" | "home";
  items: CheckoutItem[];
};

export function parseCheckout(
  body: unknown,
): { ok: true; groups: CheckoutGroup[]; profile: SellerProfileInput | null } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const record = body as { display_name?: unknown; phone?: unknown; groups?: unknown };
  const displayName = typeof record.display_name === "string" ? record.display_name.trim() : "";
  const phone = typeof record.phone === "string" ? record.phone.trim() : "";
  if (chars(phone) > 40) return { ok: false, error: "invalid_phone" };
  let profile: SellerProfileInput | null = null;
  if (displayName || phone) {
    if (chars(displayName) < 1 || chars(displayName) > 200) return { ok: false, error: "display_name_required" };
    profile = { display_name: displayName, phone: phone || null };
  }
  if (!Array.isArray(record.groups) || record.groups.length === 0) return { ok: false, error: "empty_order" };

  const seen = new Set<string>();
  const groups: CheckoutGroup[] = [];
  for (const group of record.groups) {
    if (!group || typeof group !== "object") return { ok: false, error: "invalid_request" };
    const row = group as { seller_id?: unknown; delivery_mode?: unknown; items?: unknown };
    const sellerId = typeof row.seller_id === "string" ? row.seller_id : "";
    if (!isListingId(sellerId)) return { ok: false, error: "invalid_request" };
    if (row.delivery_mode !== "pickup" && row.delivery_mode !== "home") return { ok: false, error: "invalid_delivery" };
    if (!Array.isArray(row.items) || row.items.length === 0) return { ok: false, error: "empty_order" };
    const items: CheckoutItem[] = [];
    for (const item of row.items) {
      if (!item || typeof item !== "object") return { ok: false, error: "invalid_item" };
      const line = item as { listing_id?: unknown; quantity?: unknown };
      const listingId = typeof line.listing_id === "string" ? line.listing_id : "";
      const quantity = typeof line.quantity === "number" ? line.quantity : null;
      if (!isListingId(listingId) || quantity === null || !Number.isInteger(quantity) || quantity < 1) {
        return { ok: false, error: "invalid_item" };
      }
      if (seen.has(listingId)) return { ok: false, error: "duplicate_listing" };
      seen.add(listingId);
      items.push({ listing_id: listingId, quantity });
    }
    groups.push({ seller_id: sellerId, delivery_mode: row.delivery_mode, items });
  }
  if (seen.size > 20) return { ok: false, error: "invalid_request" };
  return { ok: true, groups, profile };
}

export const orderStatuses = [
  "placed",
  "awaiting_payment",
  "payment_confirmed",
  "ready_to_ship",
  "shipped",
  "completed",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type MarketplaceOrderItem = {
  title_en: string;
  title_zh: string;
  quantity: number;
  unit_price_twd: number;
};

export type MarketplaceOrder = {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  buyer_name: string;
  seller_name: string;
  items_subtotal_twd: number;
  delivery_fee_twd: number;
  total_twd: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: MarketplaceOrderItem[];
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (orderStatuses as readonly string[]).includes(value);
}

export function nextOrderStatus(status: OrderStatus): OrderStatus | null {
  const index = orderStatuses.indexOf(status);
  return orderStatuses[index + 1] ?? null;
}

export function orderStatusLabel(status: OrderStatus): Bi {
  const labels: Record<OrderStatus, Bi> = {
    placed: { en: "Order placed", zh: "已下單" },
    awaiting_payment: { en: "Waiting for payment confirmation", zh: "待確認付款" },
    payment_confirmed: { en: "Payment confirmed", zh: "已確認付款" },
    ready_to_ship: { en: "Ready to ship", zh: "待出貨" },
    shipped: { en: "Shipped", zh: "已出貨" },
    completed: { en: "Completed", zh: "已完成" },
  };
  return labels[status];
}

export function paymentStatusLabel(status: OrderStatus): Bi {
  if (status === "placed") return { en: "Unpaid", zh: "未付款" };
  if (status === "awaiting_payment") return { en: "Waiting for confirmation", zh: "待確認付款" };
  return { en: "Paid", zh: "已付款" };
}

export function advanceButtonLabel(status: OrderStatus): Bi | null {
  const next = nextOrderStatus(status);
  if (next === "awaiting_payment") return { en: "I've paid", zh: "我已付款" };
  if (next === "payment_confirmed") return { en: "Payment confirmed", zh: "已確認付款" };
  if (next === "ready_to_ship") return { en: "Ready to ship", zh: "待出貨" };
  if (next === "shipped") return { en: "Shipped", zh: "已出貨" };
  if (next === "completed") return { en: "Completed", zh: "已完成" };
  return null;
}

export type AdminTransaction = MarketplaceOrder & {
  platform_fee_twd: number;
  awaiting_payment_at: string | null;
};

const latePaymentMs = 7 * 24 * 60 * 60 * 1000;

export function isLatePayment(status: OrderStatus, awaitingAt: string | null, now = Date.now()) {
  if (status !== "awaiting_payment" || !awaitingAt) return false;
  const time = new Date(awaitingAt).getTime();
  if (Number.isNaN(time)) return false;
  return now - time > latePaymentMs;
}

export function parsePlatformFee(body: unknown): { ok: true; fee: number } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const fee = (body as { platform_fee_twd?: unknown }).platform_fee_twd;
  if (typeof fee !== "number" || !Number.isInteger(fee) || fee < 0 || fee > 100000) {
    return { ok: false, error: "invalid_fee" };
  }
  return { ok: true, fee };
}

export function parseListingModeration(
  body: unknown,
): { ok: true; listingId: string; status: ListingStatus } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const record = body as { listing_id?: unknown; status?: unknown };
  const listingId = typeof record.listing_id === "string" ? record.listing_id : "";
  if (!isListingId(listingId) || (record.status !== "active" && record.status !== "removed")) {
    return { ok: false, error: "invalid_request" };
  }
  return { ok: true, listingId, status: record.status };
}

export function parseStatusChange(
  body: unknown,
): { ok: true; orderId: string; status: OrderStatus } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const record = body as { order_id?: unknown; status?: unknown };
  const orderId = typeof record.order_id === "string" ? record.order_id : "";
  if (!isListingId(orderId) || !isOrderStatus(record.status)) return { ok: false, error: "invalid_request" };
  return { ok: true, orderId, status: record.status };
}

import "server-only";

import type {
  CheckoutGroup,
  ListingQuote,
  ListingRecord,
  ListingWrite,
  MarketplaceOrder,
  MarketplaceOrderItem,
  OrderStatus,
  SellerProfileInput,
} from "@/lib/marketplace-record";
import { isListingId, isOrderStatus, nextOrderStatus } from "@/lib/marketplace-record";
import { marketplacePhotoUrl, removeMarketplacePhoto, uploadMarketplacePhoto } from "@/lib/marketplace-photo";
import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

const columns =
  "id, seller_id, title_en, title_zh, description_en, description_zh, price_twd, quantity, condition, category, course_name, status";

type MarketplaceRole = "buyer" | "seller" | "both";

export type MarketplaceProfile = {
  user_id: string;
  display_name: string;
  role: MarketplaceRole;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

function revalidateMarketplace() {
  revalidatePath("/en/marketplace");
  revalidatePath("/zh/marketplace");
  revalidatePath("/en/marketplace/me");
  revalidatePath("/zh/marketplace/me");
}

function asRole(value: unknown): MarketplaceRole | null {
  if (value === "buyer" || value === "seller" || value === "both") return value;
  return null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : null;
}

function asInt(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 2147483647) return value;
  return null;
}

function firstObjectName(value: unknown) {
  const rows = Array.isArray(value) ? value : [];
  const names = rows.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const record = row as { object_name?: unknown; sort_order?: unknown };
    const name = asText(record.object_name);
    const order = typeof record.sort_order === "number" ? record.sort_order : 0;
    return name ? [{ name, order }] : [];
  });
  names.sort((a, b) => a.order - b.order);
  return names[0]?.name ?? null;
}

function toListing(row: Record<string, unknown>, objectName: string | null): ListingRecord | null {
  const id = asText(row.id);
  const sellerId = asText(row.seller_id);
  const titleEn = asText(row.title_en);
  const titleZh = asText(row.title_zh);
  const descriptionEn = asText(row.description_en);
  const descriptionZh = asText(row.description_zh);
  const price = asInt(row.price_twd);
  const quantity = asInt(row.quantity);
  const condition = asText(row.condition);
  const category = asText(row.category);
  const status = asText(row.status);
  const course = row.course_name == null ? null : asText(row.course_name);
  if (
    !id ||
    !sellerId ||
    !titleEn ||
    !titleZh ||
    descriptionEn === null ||
    descriptionZh === null ||
    price === null ||
    quantity === null ||
    (condition !== "new" && condition !== "like_new" && condition !== "good" && condition !== "fair") ||
    (category !== "book" && category !== "course_material" && category !== "other") ||
    (status !== "active" && status !== "removed") ||
    (row.course_name != null && course === null)
  ) {
    return null;
  }
  return {
    id,
    seller_id: sellerId,
    title_en: titleEn,
    title_zh: titleZh,
    description_en: descriptionEn,
    description_zh: descriptionZh,
    price_twd: price,
    quantity,
    condition,
    category,
    course_name: course,
    status,
    image_url: marketplacePhotoUrl(objectName),
  };
}

export async function getMarketplaceProfile(userId: string): Promise<MarketplaceProfile | null> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select("user_id, display_name, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const role = asRole(data.role);
  const displayName = asText(data.display_name);
  const id = asText(data.user_id);
  if (!role || !displayName || !id) return null;
  return { user_id: id, display_name: displayName, role };
}

async function ensureSeller(userId: string, profile: SellerProfileInput | null): Promise<Result<true>> {
  const existing = await getMarketplaceProfile(userId);
  const supabase = createSupabaseServer();
  if (!existing) {
    if (!profile) return { ok: false, error: "display_name_required", status: 400 };
    const { error } = await supabase.from("marketplace_profiles").insert({
      user_id: userId,
      display_name: profile.display_name,
      role: "seller",
      phone: profile.phone,
    });
    if (error?.code === "23505") {
      const again = await getMarketplaceProfile(userId);
      if (again?.role === "buyer") {
        const { error: upgradeError } = await supabase
          .from("marketplace_profiles")
          .update({ role: "both" })
          .eq("user_id", userId)
          .eq("role", "buyer");
        if (upgradeError) return { ok: false, error: "save_failed", status: 500 };
      }
      return { ok: true, value: true };
    }
    if (error) return { ok: false, error: "save_failed", status: 500 };
    return { ok: true, value: true };
  }
  if (existing.role === "seller" || existing.role === "both") return { ok: true, value: true };
  const { error } = await supabase.from("marketplace_profiles").update({ role: "both" }).eq("user_id", userId).eq("role", "buyer");
  if (error) return { ok: false, error: "save_failed", status: 500 };
  return { ok: true, value: true };
}

async function imageName(listingId: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("listing_images")
    .select("object_name, sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return asText(data.object_name);
}

export async function listActiveListings(): Promise<ListingRecord[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("listings")
    .select(`${columns}, listing_images(object_name, sort_order)`)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load listings.");
  return (data ?? []).flatMap((row) => {
    const record = row as Record<string, unknown>;
    const listing = toListing(record, firstObjectName(record.listing_images));
    return listing ? [listing] : [];
  });
}

const orderErrors = [
  "cannot_buy_own_listing",
  "buyer_not_allowed",
  "seller_not_allowed",
  "invalid_delivery",
  "empty_order",
  "invalid_item",
  "duplicate_listing",
  "listing_not_available",
  "insufficient_stock",
  "settings_missing",
  "invalid_status_step",
  "not_your_order",
  "order_not_found",
  "order_snapshot_locked",
] as const;

function orderErrorCode(error: { message?: string; details?: string | null }) {
  const blob = `${error.message ?? ""}\n${error.details ?? ""}`;
  return orderErrors.find((code) => blob.includes(code)) ?? "save_failed";
}

async function ensureBuyer(userId: string, profile: SellerProfileInput | null): Promise<Result<true>> {
  const existing = await getMarketplaceProfile(userId);
  const supabase = createSupabaseServer();
  if (!existing) {
    if (!profile) return { ok: false, error: "display_name_required", status: 400 };
    const { error } = await supabase.from("marketplace_profiles").insert({
      user_id: userId,
      display_name: profile.display_name,
      role: "buyer",
      phone: profile.phone,
    });
    if (error?.code === "23505") {
      const again = await getMarketplaceProfile(userId);
      if (again?.role === "seller") {
        const { error: upgradeError } = await supabase
          .from("marketplace_profiles")
          .update({ role: "both" })
          .eq("user_id", userId)
          .eq("role", "seller");
        if (upgradeError) return { ok: false, error: "save_failed", status: 500 };
      }
      return { ok: true, value: true };
    }
    if (error) return { ok: false, error: "save_failed", status: 500 };
    return { ok: true, value: true };
  }
  if (existing.role === "buyer" || existing.role === "both") return { ok: true, value: true };
  const { error } = await supabase.from("marketplace_profiles").update({ role: "both" }).eq("user_id", userId).eq("role", "seller");
  if (error) return { ok: false, error: "save_failed", status: 500 };
  return { ok: true, value: true };
}

export async function getListingsByIds(ids: string[]): Promise<ListingQuote[]> {
  const unique = [...new Set(ids)].slice(0, 20);
  if (!unique.length) return [];
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("listings")
    .select(`${columns}, listing_images(object_name, sort_order)`)
    .in("id", unique);
  if (error) throw new Error("Could not load listings.");
  const rows = (data ?? []).flatMap((row) => {
    const record = row as Record<string, unknown>;
    const listing = toListing(record, firstObjectName(record.listing_images));
    return listing ? [listing] : [];
  });
  const sellerIds = [...new Set(rows.map((row) => row.seller_id))];
  const { data: profiles } = await supabase.from("marketplace_profiles").select("user_id, display_name").in("user_id", sellerIds);
  const names = new Map<string, string>();
  for (const profile of profiles ?? []) {
    const id = asText(profile.user_id);
    const name = asText(profile.display_name);
    if (id && name) names.set(id, name);
  }
  return rows.map((row) => ({ ...row, seller_name: names.get(row.seller_id) ?? "" }));
}

export type PlacedOrder = { order_id: string; seller_id: string };
export type FailedOrder = { seller_id: string; error: string };

export async function placeMarketplaceOrders(
  userId: string,
  profile: SellerProfileInput | null,
  groups: CheckoutGroup[],
): Promise<Result<{ placed: PlacedOrder[]; failed: FailedOrder[] }>> {
  const buyer = await ensureBuyer(userId, profile);
  if (!buyer.ok) return buyer;

  const ids = groups.flatMap((group) => group.items.map((item) => item.listing_id));
  const listings = await getListingsByIds(ids);
  const byId = new Map(listings.map((listing) => [listing.id, listing]));

  for (const group of groups) {
    if (group.seller_id === userId) return { ok: false, error: "cannot_buy_own_listing", status: 400 };
    for (const item of group.items) {
      const listing = byId.get(item.listing_id);
      if (!listing || listing.status !== "active") return { ok: false, error: "listing_not_available", status: 400 };
      if (listing.seller_id !== group.seller_id) return { ok: false, error: "invalid_item", status: 400 };
      if (listing.seller_id === userId) return { ok: false, error: "cannot_buy_own_listing", status: 400 };
      if (item.quantity > listing.quantity) return { ok: false, error: "insufficient_stock", status: 400 };
    }
  }

  const supabase = createSupabaseServer();
  const placed: PlacedOrder[] = [];
  const failed: FailedOrder[] = [];
  for (const group of groups) {
    const { data, error } = await supabase.rpc("create_marketplace_order", {
      p_buyer_id: userId,
      p_seller_id: group.seller_id,
      p_delivery_mode: group.delivery_mode,
      p_items: group.items,
    });
    const orderId = asText(data);
    if (error || !orderId) {
      failed.push({ seller_id: group.seller_id, error: error ? orderErrorCode(error) : "save_failed" });
      continue;
    }
    const buyer = await getMarketplaceProfile(userId);
    await recordStatusEvent(orderId, "placed", userId, buyer?.display_name ?? profile?.display_name ?? "");
    placed.push({ order_id: orderId, seller_id: group.seller_id });
  }

  if (!placed.length) {
    return { ok: false, error: failed[0]?.error ?? "save_failed", status: 400 };
  }
  revalidateMarketplace();
  return { ok: true, value: { placed, failed } };
}

export async function getListing(id: string): Promise<ListingRecord | null> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("listings").select(columns).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toListing(data as Record<string, unknown>, await imageName(id));
}

async function storePhoto(bytes: Uint8Array | null) {
  if (!bytes) return { ok: true as const, objectName: null };
  return uploadMarketplacePhoto(bytes);
}

async function attachPhoto(listingId: string, objectName: string, previous: string | null) {
  const supabase = createSupabaseServer();
  if (previous) {
    const { data, error } = await supabase
      .from("listing_images")
      .update({ object_name: objectName })
      .eq("listing_id", listingId)
      .select("id");
    if (error || !data?.length) return false;
    if (previous !== objectName) await removeMarketplacePhoto(previous);
    return true;
  }
  const { error } = await supabase.from("listing_images").insert({
    listing_id: listingId,
    object_name: objectName,
    sort_order: 0,
  });
  return !error;
}

export async function createListing(
  userId: string,
  value: ListingWrite,
  profile: SellerProfileInput | null,
  photo: Uint8Array | null,
): Promise<Result<ListingRecord>> {
  const seller = await ensureSeller(userId, profile);
  if (!seller.ok) return seller;

  const uploaded = await storePhoto(photo);
  if (!uploaded.ok) return { ok: false, error: uploaded.error, status: uploaded.error === "photo_failed" ? 500 : 400 };

  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: userId,
      title_en: value.title_en,
      title_zh: value.title_zh,
      description_en: value.description_en,
      description_zh: value.description_zh,
      price_twd: value.price_twd,
      quantity: value.quantity,
      condition: value.condition,
      category: value.category,
      course_name: value.course_name,
      status: "active",
    })
    .select(columns)
    .single();
  if (error || !data) {
    if (uploaded.objectName) await removeMarketplacePhoto(uploaded.objectName);
    return { ok: false, error: "save_failed", status: 500 };
  }

  const listing = toListing(data as Record<string, unknown>, null);
  if (!listing) return { ok: false, error: "save_failed", status: 500 };
  if (uploaded.objectName) {
    const attached = await attachPhoto(listing.id, uploaded.objectName, null);
    if (!attached) {
      await removeMarketplacePhoto(uploaded.objectName);
      await supabase.from("listings").delete().eq("id", listing.id).eq("seller_id", userId);
      return { ok: false, error: "photo_failed", status: 500 };
    }
    listing.image_url = marketplacePhotoUrl(uploaded.objectName);
  }
  revalidateMarketplace();
  return { ok: true, value: listing };
}

export async function updateListing(
  userId: string,
  id: string,
  value: ListingWrite,
  photo: Uint8Array | null,
  removePhoto: boolean,
): Promise<Result<ListingRecord>> {
  const existing = await getListing(id);
  if (!existing || existing.seller_id !== userId) return { ok: false, error: "not_found", status: 404 };

  const uploaded = await storePhoto(photo);
  if (!uploaded.ok) return { ok: false, error: uploaded.error, status: uploaded.error === "photo_failed" ? 500 : 400 };

  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("listings")
    .update({
      title_en: value.title_en,
      title_zh: value.title_zh,
      description_en: value.description_en,
      description_zh: value.description_zh,
      price_twd: value.price_twd,
      quantity: value.quantity,
      condition: value.condition,
      category: value.category,
      course_name: value.course_name,
      status: value.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("seller_id", userId)
    .select(columns)
    .maybeSingle();
  if (error || !data) {
    if (uploaded.objectName) await removeMarketplacePhoto(uploaded.objectName);
    return { ok: false, error: error ? "save_failed" : "not_found", status: error ? 500 : 404 };
  }

  const previous = await imageName(id);
  if (uploaded.objectName) {
    const attached = await attachPhoto(id, uploaded.objectName, previous);
    if (!attached) {
      await removeMarketplacePhoto(uploaded.objectName);
      return { ok: false, error: "photo_failed", status: 500 };
    }
  } else if (removePhoto && previous) {
    const { error: imageError } = await supabase.from("listing_images").delete().eq("listing_id", id);
    if (imageError) return { ok: false, error: "photo_failed", status: 500 };
    await removeMarketplacePhoto(previous);
  }

  const listing = toListing(data as Record<string, unknown>, uploaded.objectName ?? (removePhoto ? null : previous));
  if (!listing) return { ok: false, error: "save_failed", status: 500 };
  revalidateMarketplace();
  return { ok: true, value: listing };
}

const orderColumns =
  "id, buyer_id, seller_id, buyer_name, seller_name, items_subtotal_twd, delivery_fee_twd, total_twd, status, created_at, updated_at, order_items(title_en, title_zh, quantity, unit_price_twd)";

function toOrderItem(value: unknown): MarketplaceOrderItem | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const titleEn = asText(row.title_en);
  const titleZh = asText(row.title_zh);
  const quantity = asInt(row.quantity);
  const price = asInt(row.unit_price_twd);
  if (!titleEn || !titleZh || quantity === null || quantity < 1 || price === null) return null;
  return { title_en: titleEn, title_zh: titleZh, quantity, unit_price_twd: price };
}

function toOrder(row: Record<string, unknown>): MarketplaceOrder | null {
  const id = asText(row.id);
  const buyerName = asText(row.buyer_name);
  const sellerName = asText(row.seller_name);
  const subtotal = asInt(row.items_subtotal_twd);
  const deliveryFee = asInt(row.delivery_fee_twd);
  const total = asInt(row.total_twd);
  const status = asText(row.status);
  const createdAt = asText(row.created_at);
  const updatedAt = asText(row.updated_at);
  const items = Array.isArray(row.order_items) ? row.order_items.flatMap((item) => {
    const parsed = toOrderItem(item);
    return parsed ? [parsed] : [];
  }) : [];
  if (!id || !buyerName || !sellerName || subtotal === null || deliveryFee === null || total === null || !isOrderStatus(status) || !createdAt || !updatedAt) {
    return null;
  }
  return {
    id,
    buyer_id: row.buyer_id == null ? null : asText(row.buyer_id),
    seller_id: row.seller_id == null ? null : asText(row.seller_id),
    buyer_name: buyerName,
    seller_name: sellerName,
    items_subtotal_twd: subtotal,
    delivery_fee_twd: deliveryFee,
    total_twd: total,
    status,
    created_at: createdAt,
    updated_at: updatedAt,
    items,
  };
}

export async function listMyOrders(userId: string): Promise<{ buyerOrders: MarketplaceOrder[]; sellerOrders: MarketplaceOrder[] }> {
  if (!isListingId(userId)) return { buyerOrders: [], sellerOrders: [] };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("orders")
    .select(orderColumns)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load orders.");
  const orders = (data ?? []).flatMap((row) => {
    const order = toOrder(row as Record<string, unknown>);
    return order ? [order] : [];
  });
  return {
    buyerOrders: orders.filter((order) => order.buyer_id === userId),
    sellerOrders: orders.filter((order) => order.seller_id === userId),
  };
}

async function loadOrder(orderId: string): Promise<MarketplaceOrder | null> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("orders").select(orderColumns).eq("id", orderId).maybeSingle();
  if (error || !data) return null;
  return toOrder(data as Record<string, unknown>);
}

async function recordStatusEvent(orderId: string, status: OrderStatus, actorId: string, actorLabel: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("order_status_events")
    .select("id, actor_id")
    .eq("order_id", orderId)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return false;
  const latest = data?.[0];
  if (!latest) {
    const { error: insertError } = await supabase.from("order_status_events").insert({
      order_id: orderId,
      status,
      actor_id: actorId,
      actor_label: actorLabel || null,
    });
    return !insertError;
  }
  if (latest.actor_id) return true;
  const { error: updateError } = await supabase
    .from("order_status_events")
    .update({ actor_id: actorId, actor_label: actorLabel || null })
    .eq("id", latest.id);
  return !updateError;
}

export async function advanceMarketplaceOrder(
  userId: string,
  orderId: string,
  nextStatus: OrderStatus,
): Promise<Result<MarketplaceOrder>> {
  if (!isListingId(userId) || !isListingId(orderId)) return { ok: false, error: "invalid_request", status: 400 };
  const current = await loadOrder(orderId);
  if (!current) return { ok: false, error: "order_not_found", status: 404 };
  if (nextOrderStatus(current.status) !== nextStatus) return { ok: false, error: "invalid_status_step", status: 400 };
  if (current.status === "placed") {
    if (current.buyer_id !== userId) return { ok: false, error: "not_your_order", status: 403 };
  } else if (current.seller_id !== userId) {
    return { ok: false, error: "not_your_order", status: 403 };
  }

  const profile = await getMarketplaceProfile(userId);
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId)
    .eq("status", current.status)
    .select("id");
  if (error) return { ok: false, error: orderErrorCode(error), status: 400 };
  if (!data?.length) return { ok: false, error: "invalid_status_step", status: 400 };

  const recorded = await recordStatusEvent(orderId, nextStatus, userId, profile?.display_name ?? "");
  if (!recorded) return { ok: false, error: "save_failed", status: 500 };

  const updated = await loadOrder(orderId);
  if (!updated) return { ok: false, error: "save_failed", status: 500 };
  revalidateMarketplace();
  return { ok: true, value: updated };
}

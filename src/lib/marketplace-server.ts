import "server-only";

import type { ListingRecord, ListingWrite, SellerProfileInput } from "@/lib/marketplace-record";
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

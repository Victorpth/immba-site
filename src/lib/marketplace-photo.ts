import "server-only";

import { createSupabaseServer } from "@/lib/supabase-server";

const bucket = "marketplace-photos";
const maxBytes = 5 * 1024 * 1024;

export function marketplacePhotoUrl(objectName: string | null): string | null {
  if (!objectName || !/^[A-Za-z0-9._/-]+$/.test(objectName) || objectName.includes("..")) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const path = objectName.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function sniffMarketplacePhoto(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; contentType: string } | null {
  if (bytes.length < 12 || bytes.length > maxBytes) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { ext: "png", contentType: "image/png" };
  }
  const tag = new TextDecoder().decode(bytes.subarray(0, 4));
  const format = new TextDecoder().decode(bytes.subarray(8, 12));
  if (tag === "RIFF" && format === "WEBP") return { ext: "webp", contentType: "image/webp" };
  return null;
}

export async function uploadMarketplacePhoto(bytes: Uint8Array) {
  if (bytes.length > maxBytes) return { ok: false as const, error: "photo_too_large" };
  const kind = sniffMarketplacePhoto(bytes);
  if (!kind) return { ok: false as const, error: "photo_type" };

  const objectName = `${crypto.randomUUID()}.${kind.ext}`;
  const supabase = createSupabaseServer();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const { error } = await supabase.storage.from(bucket).upload(objectName, new Blob([copy], { type: kind.contentType }), {
    contentType: kind.contentType,
    upsert: false,
  });
  if (error) return { ok: false as const, error: "photo_failed" };
  return { ok: true as const, objectName };
}

export async function removeMarketplacePhoto(objectName: string | null) {
  if (!objectName || !/^[A-Za-z0-9._/-]+$/.test(objectName) || objectName.includes("..")) return;
  const supabase = createSupabaseServer();
  await supabase.storage.from(bucket).remove([objectName]);
}

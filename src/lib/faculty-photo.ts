import "server-only";

import { createSupabaseServer } from "@/lib/supabase-server";

const bucket = "faculty-photos";
const maxBytes = 5 * 1024 * 1024;

export function sniffFacultyPhoto(bytes: Uint8Array): { ext: "jpg" | "png" | "webp"; contentType: string } | null {
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

export function facultyPhotoObjectName(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!imageUrl.startsWith(prefix)) return null;
  let name = imageUrl.slice(prefix.length).split("?")[0];
  try {
    name = decodeURIComponent(name);
  } catch {
    return null;
  }
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes("..")) return null;
  return name;
}

export async function uploadFacultyPhoto(bytes: Uint8Array) {
  if (bytes.length > maxBytes) return { ok: false as const, error: "photo_too_large" };
  const kind = sniffFacultyPhoto(bytes);
  if (!kind) return { ok: false as const, error: "photo_type" };

  const name = `${crypto.randomUUID()}.${kind.ext}`;
  const supabase = createSupabaseServer();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const { error } = await supabase.storage.from(bucket).upload(name, new Blob([copy], { type: kind.contentType }), {
    contentType: kind.contentType,
    upsert: false,
  });
  if (error) return { ok: false as const, error: "photo_failed" };

  const { data } = supabase.storage.from(bucket).getPublicUrl(name);
  return { ok: true as const, imageUrl: data.publicUrl };
}

export async function removeFacultyPhoto(imageUrl: string | null) {
  const name = facultyPhotoObjectName(imageUrl);
  if (!name) return { removed: false, failed: false };
  const supabase = createSupabaseServer();
  const { error } = await supabase.storage.from(bucket).remove([name]);
  if (error) return { removed: false, failed: true };
  return { removed: true, failed: false };
}

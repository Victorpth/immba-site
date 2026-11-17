"use server";

import { getAccess } from "@/lib/auth-access";
import { formLang } from "@/lib/auth-path";
import { isListingId, parseListingFields } from "@/lib/marketplace-record";
import { createListing, updateListing } from "@/lib/marketplace-server";
import { redirect } from "next/navigation";

export type ListingFormState = { error?: string; message?: string };

const maxBytes = 5 * 1024 * 1024;

async function readPhoto(form: FormData) {
  const file = form.get("photo");
  if (file == null || typeof file === "string") return { ok: true as const, bytes: null };
  if (!(file instanceof Blob) || file.size === 0) return { ok: true as const, bytes: null };
  if (file.size > maxBytes) return { ok: false as const, error: "photo_too_large" };
  return { ok: true as const, bytes: new Uint8Array(await file.arrayBuffer()) };
}

export async function saveListing(_state: ListingFormState, form: FormData): Promise<ListingFormState> {
  const lang = formLang(form.get("lang"));
  const access = await getAccess();
  if (access.status !== "authenticated") return { error: "unauthorized" };

  const mode = form.get("mode") === "update" ? "update" : "create";
  const parsed = parseListingFields(form, mode);
  if (!parsed.ok) return { error: parsed.error };

  const photo = await readPhoto(form);
  if (!photo.ok) return { error: photo.error };

  try {
    if (mode === "create") {
      const saved = await createListing(access.userId, parsed.value, parsed.profile, photo.bytes);
      if (!saved.ok) return { error: saved.error };
    } else {
      const id = form.get("listing_id");
      if (typeof id !== "string" || !isListingId(id)) return { error: "invalid_request" };
      const saved = await updateListing(access.userId, id, parsed.value, photo.bytes, parsed.removePhoto);
      if (!saved.ok) return { error: saved.error };
      if (saved.value.status === "removed") return { message: "removed" };
    }
  } catch {
    return { error: "save_failed" };
  }

  redirect(`/${lang}/marketplace`);
}

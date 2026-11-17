import { getAccess } from "@/lib/auth-access";
import { parseListingFields } from "@/lib/marketplace-record";
import { createListing } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

const maxBytes = 5 * 1024 * 1024;

async function readPhoto(form: FormData) {
  const file = form.get("photo");
  if (file == null || typeof file === "string") return { ok: true as const, bytes: null };
  if (!(file instanceof Blob) || file.size === 0) return { ok: true as const, bytes: null };
  if (file.size > maxBytes) return { ok: false as const, error: "photo_too_large" };
  return { ok: true as const, bytes: new Uint8Array(await file.arrayBuffer()) };
}

export async function POST(request: Request) {
  const access = await getAccess();
  if (access.status !== "authenticated") return Response.json({ error: "unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseListingFields(form, "create");
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const photo = await readPhoto(form);
  if (!photo.ok) return Response.json({ error: photo.error }, { status: 400 });

  try {
    const saved = await createListing(access.userId, parsed.value, parsed.profile, photo.bytes);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json({ id: saved.value.id, status: saved.value.status }, { status: 201 });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

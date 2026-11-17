import { getAccess } from "@/lib/auth-access";
import { isListingId, parseListingFields } from "@/lib/marketplace-record";
import { updateListing } from "@/lib/marketplace-server";

export const dynamic = "force-dynamic";

const maxBytes = 5 * 1024 * 1024;

type Context = { params: Promise<{ id: string }> };

async function readPhoto(form: FormData) {
  const file = form.get("photo");
  if (file == null || typeof file === "string") return { ok: true as const, bytes: null };
  if (!(file instanceof Blob) || file.size === 0) return { ok: true as const, bytes: null };
  if (file.size > maxBytes) return { ok: false as const, error: "photo_too_large" };
  return { ok: true as const, bytes: new Uint8Array(await file.arrayBuffer()) };
}

export async function PUT(request: Request, { params }: Context) {
  const access = await getAccess();
  if (access.status !== "authenticated") return Response.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isListingId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseListingFields(form, "update");
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const photo = await readPhoto(form);
  if (!photo.ok) return Response.json({ error: photo.error }, { status: 400 });

  try {
    const saved = await updateListing(access.userId, id, parsed.value, photo.bytes, parsed.removePhoto);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: saved.status });
    return Response.json({ id: saved.value.id, status: saved.value.status });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

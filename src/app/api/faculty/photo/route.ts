import { requireStaff } from "@/lib/auth-access";
import { uploadFacultyPhoto } from "@/lib/faculty-photo";

export const dynamic = "force-dynamic";

const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const file = form.get("file");
  if (typeof file === "string" || !(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  if (file.size > maxBytes) return Response.json({ error: "photo_too_large" }, { status: 400 });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const uploaded = await uploadFacultyPhoto(bytes);
    if (!uploaded.ok) return Response.json({ error: uploaded.error }, { status: uploaded.error === "photo_failed" ? 500 : 400 });
    return Response.json({ image_url: uploaded.imageUrl }, { status: 201 });
  } catch {
    return Response.json({ error: "photo_failed" }, { status: 500 });
  }
}

import { requireStaff } from "@/lib/auth-access";
import { isFacultyId, parseFacultyWrite, toFacultyRecord } from "@/lib/faculty-record";
import { removeFacultyPhoto } from "@/lib/faculty-photo";
import { revalidateFacultyPages } from "@/lib/faculty-server";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (!isFacultyId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseFacultyWrite(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const supabase = createSupabaseServer();
    const { data: existing, error: existingError } = await supabase.from("faculty").select("image_url").eq("id", id).maybeSingle();
    if (existingError) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!existing) return Response.json({ error: "not_found" }, { status: 404 });

    const previousPhoto = typeof existing.image_url === "string" ? existing.image_url : null;
    const { data, error } = await supabase.from("faculty").update(parsed.value).eq("id", id).select().maybeSingle();
    if (error) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!data) return Response.json({ error: "not_found" }, { status: 404 });
    const record = toFacultyRecord(data);
    if (!record) return Response.json({ error: "save_failed" }, { status: 500 });
    if (previousPhoto && previousPhoto !== record.image_url) {
      const removed = await removeFacultyPhoto(previousPhoto);
      if (removed.failed) return Response.json({ error: "photo_delete_failed" }, { status: 500 });
    }
    revalidateFacultyPages();
    return Response.json(record);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (!isFacultyId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const supabase = createSupabaseServer();
    const { data: existing, error: existingError } = await supabase.from("faculty").select("image_url").eq("id", id).maybeSingle();
    if (existingError) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!existing) return Response.json({ error: "not_found" }, { status: 404 });

    const { data, error } = await supabase.from("faculty").delete().eq("id", id).select("id").maybeSingle();
    if (error) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!data) return Response.json({ error: "not_found" }, { status: 404 });
    const removed = await removeFacultyPhoto(typeof existing.image_url === "string" ? existing.image_url : null);
    if (removed.failed) return Response.json({ error: "photo_delete_failed" }, { status: 500 });
    revalidateFacultyPages();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

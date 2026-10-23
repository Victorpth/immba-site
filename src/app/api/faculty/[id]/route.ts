import { isFacultyId, parseFacultyWrite, toFacultyRecord } from "@/lib/faculty-record";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  // TODO: verify admin authentication before updating a faculty record.
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
    const { data, error } = await supabase.from("faculty").update(parsed.value).eq("id", id).select().maybeSingle();
    if (error) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!data) return Response.json({ error: "not_found" }, { status: 404 });
    const record = toFacultyRecord(data);
    if (!record) return Response.json({ error: "save_failed" }, { status: 500 });
    return Response.json(record);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  // TODO: verify admin authentication before deleting a faculty record.
  const { id } = await params;
  if (!isFacultyId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase.from("faculty").delete().eq("id", id).select("id").maybeSingle();
    if (error) return Response.json({ error: "save_failed" }, { status: 500 });
    if (!data) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

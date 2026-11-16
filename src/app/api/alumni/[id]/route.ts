import { requireStaff } from "@/lib/auth-access";
import { isAlumniId, parseAlumniWrite } from "@/lib/alumni-record";
import { deleteAlumni, updateAlumni } from "@/lib/alumni-server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (!isAlumniId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseAlumniWrite(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await updateAlumni(id, parsed.value);
    if (!saved.ok) {
      const status = saved.error === "duplicate_student_id" ? 409 : saved.error === "not_found" ? 404 : 500;
      return Response.json({ error: saved.error }, { status });
    }
    return Response.json(saved.record);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (!isAlumniId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const removed = await deleteAlumni(id);
    if (!removed.ok) {
      const status = removed.error === "not_found" ? 404 : 500;
      return Response.json({ error: removed.error }, { status });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

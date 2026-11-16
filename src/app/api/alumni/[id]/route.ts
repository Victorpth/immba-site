import { isAlumniId, parseAlumniWrite } from "@/lib/alumni-record";
import { alumniActor, deleteAlumni, updateAlumni } from "@/lib/alumni-server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function statusFor(error: string) {
  if (error === "duplicate_student_id") return 409;
  if (error === "not_found") return 404;
  return 500;
}

export async function PUT(request: Request, { params }: Context) {
  const guard = await alumniActor();
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
    const saved = await updateAlumni(id, parsed.value, guard.actor);
    if (!saved.ok) return Response.json({ error: saved.error }, { status: statusFor(saved.error) });
    return Response.json(saved.record);
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const guard = await alumniActor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (!isAlumniId(id)) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const removed = await deleteAlumni(id, guard.actor);
    if (!removed.ok) return Response.json({ error: removed.error }, { status: statusFor(removed.error) });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

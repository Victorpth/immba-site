import { requireStaff } from "@/lib/auth-access";
import { parseAlumniWrite } from "@/lib/alumni-record";
import { insertAlumni, listAlumni } from "@/lib/alumni-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  try {
    return Response.json(await listAlumni());
  } catch {
    return Response.json({ error: "load_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireStaff();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = parseAlumniWrite(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await insertAlumni(parsed.value);
    if (!saved.ok) {
      const status = saved.error === "duplicate_student_id" ? 409 : 500;
      return Response.json({ error: saved.error }, { status });
    }
    return Response.json(saved.record, { status: 201 });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

import { requireStaff } from "@/lib/auth-access";
import { parseFacultyWrite, toFacultyRecord } from "@/lib/faculty-record";
import { listFaculty, revalidateFacultyPages } from "@/lib/faculty-server";
import { createSupabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await listFaculty());
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

  const parsed = parseFacultyWrite(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const supabase = createSupabaseServer();
    const { data, error } = await supabase.from("faculty").insert(parsed.value).select().single();
    if (error || !data) return Response.json({ error: "save_failed" }, { status: 500 });
    const record = toFacultyRecord(data);
    if (!record) return Response.json({ error: "save_failed" }, { status: 500 });
    revalidateFacultyPages();
    return Response.json(record, { status: 201 });
  } catch {
    return Response.json({ error: "save_failed" }, { status: 500 });
  }
}

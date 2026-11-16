import { alumniActor, listAlumniAudit } from "@/lib/alumni-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await alumniActor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });
  try {
    return Response.json(await listAlumniAudit());
  } catch {
    return Response.json({ error: "history_failed" }, { status: 500 });
  }
}

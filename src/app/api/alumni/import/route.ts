import { alumniActor, importAlumniRows } from "@/lib/alumni-server";

export const dynamic = "force-dynamic";

const maxRows = 1000;

function importBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const filename = typeof record.filename === "string" ? record.filename : "";
  if (!Array.isArray(record.rows) || record.rows.length > maxRows) return null;
  const rows: { line: number; value: unknown }[] = [];
  for (const row of record.rows) {
    if (!row || typeof row !== "object") return null;
    const line = (row as { line?: unknown }).line;
    if (typeof line !== "number" || !Number.isInteger(line) || line < 2) return null;
    rows.push({ line, value: row });
  }
  return { filename, rows };
}

export async function POST(request: Request) {
  const guard = await alumniActor();
  if (!guard.ok) return Response.json({ error: guard.error }, { status: guard.status });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const parsed = importBody(body);
  if (!parsed) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const result = await importAlumniRows(parsed.filename, parsed.rows, guard.actor);
    if (result.auditFailed) {
      return Response.json({ error: "audit_failed", imported: result.imported, rejected: result.rejected }, { status: 500 });
    }
    return Response.json({ imported: result.imported, rejected: result.rejected });
  } catch {
    return Response.json({ error: "import_failed" }, { status: 500 });
  }
}

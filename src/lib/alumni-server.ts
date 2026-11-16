import "server-only";

import { getAccess, isStaff } from "@/lib/auth-access";
import { parseAlumniWrite, toAlumniRecord, type AlumniAuditLog, type AlumniRecord, type AlumniWrite } from "@/lib/alumni-record";
import { createSupabaseServer } from "@/lib/supabase-server";

type Actor = { id: string; email: string | null };

type WriteFailure = { ok: false; error: "duplicate_student_id" | "save_failed" | "not_found" | "audit_failed" };

export async function alumniActor(): Promise<
  { ok: true; actor: Actor } | { ok: false; status: 401 | 403; error: "unauthorized" | "forbidden" }
> {
  const access = await getAccess();
  if (access.status === "anonymous") return { ok: false, status: 401, error: "unauthorized" };
  if (!isStaff(access)) return { ok: false, status: 403, error: "forbidden" };
  return { ok: true, actor: { id: access.userId, email: access.email } };
}

function failure(error: { code?: string } | null, fallback: "save_failed" | "not_found" = "save_failed"): WriteFailure {
  if (error?.code === "23505") return { ok: false, error: "duplicate_student_id" };
  return { ok: false, error: fallback };
}

const columns =
  "id, full_name, student_id, department, degree_program, admission_year, graduation_year, email, phone, company, job_title, notes";

export async function listAlumni(): Promise<AlumniRecord[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").select(columns).order("full_name", { ascending: true });
  if (error || !data) throw new Error("Alumni could not be loaded.");
  return data.flatMap((row) => {
    const record = toAlumniRecord(row as Record<string, unknown>);
    return record ? [record] : [];
  });
}

export async function studentIdTaken(studentId: string, exceptId?: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").select("id").eq("student_id", studentId).limit(1);
  if (error) throw new Error("Alumni could not be checked.");
  const existing = data?.[0]?.id;
  return typeof existing === "string" && existing !== exceptId;
}

function asRow(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function studentLabel(row: Record<string, unknown> | null) {
  return typeof row?.student_id === "string" ? row.student_id : "";
}

async function fullAlumni(id: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Alumni could not be read.");
  return asRow(data);
}

async function writeAudit(entry: {
  actor: Actor;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT";
  recordId: string | null;
  recordLabel: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  const supabase = createSupabaseServer();
  const { error } = await supabase.from("audit_logs").insert({
    admin_id: entry.actor.id,
    admin_email: entry.actor.email,
    action: entry.action,
    table_name: "alumni",
    record_id: entry.recordId,
    record_label: entry.recordLabel,
    old_data: entry.oldData,
    new_data: entry.newData,
  });
  return !error;
}

export async function insertAlumni(
  value: AlumniWrite,
  actor: Actor,
): Promise<{ ok: true; record: AlumniRecord } | WriteFailure> {
  if (await studentIdTaken(value.student_id)) return { ok: false, error: "duplicate_student_id" };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").insert(value).select("*").single();
  if (error || !data) return failure(error);
  const row = asRow(data);
  const record = row ? toAlumniRecord(row) : null;
  if (!row || !record) return { ok: false, error: "save_failed" };
  const logged = await writeAudit({
    actor,
    action: "CREATE",
    recordId: record.id,
    recordLabel: record.student_id,
    oldData: null,
    newData: row,
  });
  if (!logged) return { ok: false, error: "audit_failed" };
  return { ok: true, record };
}

export async function updateAlumni(
  id: string,
  value: AlumniWrite,
  actor: Actor,
): Promise<{ ok: true; record: AlumniRecord } | WriteFailure> {
  const previous = await fullAlumni(id);
  if (!previous) return { ok: false, error: "not_found" };
  if (await studentIdTaken(value.student_id, id)) return { ok: false, error: "duplicate_student_id" };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").update(value).eq("id", id).select("*").maybeSingle();
  if (error) return failure(error);
  const row = asRow(data);
  const record = row ? toAlumniRecord(row) : null;
  if (!row || !record) return { ok: false, error: "save_failed" };
  const logged = await writeAudit({
    actor,
    action: "UPDATE",
    recordId: record.id,
    recordLabel: record.student_id,
    oldData: previous,
    newData: row,
  });
  if (!logged) return { ok: false, error: "audit_failed" };
  return { ok: true, record };
}

export type ImportRejection = { line: number; error: string };

function cleanFilename(value: unknown) {
  if (typeof value !== "string") return "";
  const base = value.split(/[/\\]/).pop() ?? "";
  return base.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 180);
}

export async function importAlumniRows(
  filename: string,
  rows: { line: number; value: unknown }[],
  actor: Actor,
): Promise<{ imported: number; rejected: ImportRejection[]; auditFailed: boolean }> {
  const taken = new Set((await listAlumni()).map((person) => person.student_id));
  const seen = new Set<string>();
  const rejected: ImportRejection[] = [];
  let imported = 0;
  const supabase = createSupabaseServer();

  for (const row of rows) {
    const parsed = parseAlumniWrite(row.value);
    if (!parsed.ok) {
      rejected.push({ line: row.line, error: parsed.error });
      continue;
    }
    if (seen.has(parsed.value.student_id) || taken.has(parsed.value.student_id)) {
      rejected.push({ line: row.line, error: "duplicate_student_id" });
      continue;
    }
    const { error } = await supabase.from("alumni").insert(parsed.value);
    if (error) {
      rejected.push({ line: row.line, error: failure(error).error });
      continue;
    }
    seen.add(parsed.value.student_id);
    taken.add(parsed.value.student_id);
    imported += 1;
  }

  if (imported === 0) return { imported, rejected, auditFailed: false };
  const label = cleanFilename(filename) || "alumni.csv";
  const logged = await writeAudit({
    actor,
    action: "IMPORT",
    recordId: null,
    recordLabel: label,
    oldData: null,
    newData: { filename: label, imported_count: imported },
  });
  return { imported, rejected, auditFailed: !logged };
}

export async function deleteAlumni(id: string, actor: Actor): Promise<{ ok: true } | WriteFailure> {
  const previous = await fullAlumni(id);
  if (!previous) return { ok: false, error: "not_found" };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").delete().eq("id", id).select("id").maybeSingle();
  if (error) return failure(error);
  if (!data) return { ok: false, error: "not_found" };
  const logged = await writeAudit({
    actor,
    action: "DELETE",
    recordId: id,
    recordLabel: studentLabel(previous),
    oldData: previous,
    newData: null,
  });
  if (!logged) return { ok: false, error: "audit_failed" };
  return { ok: true };
}

function asAuditObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function listAlumniAudit(): Promise<AlumniAuditLog[]> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, created_at, admin_email, action, record_label, old_data, new_data")
    .eq("table_name", "alumni")
    .order("created_at", { ascending: false });
  if (error || !data) throw new Error("The activity history could not be loaded.");
  return data.flatMap((row) => {
    const id = row.id === null || row.id === undefined ? "" : String(row.id);
    const createdAt = typeof row.created_at === "string" ? row.created_at : "";
    if (!id || !createdAt) return [];
    return [
      {
        id,
        created_at: createdAt,
        admin_email: typeof row.admin_email === "string" ? row.admin_email : null,
        action: typeof row.action === "string" ? row.action : "",
        record_label: typeof row.record_label === "string" ? row.record_label : null,
        old_data: asAuditObject(row.old_data),
        new_data: asAuditObject(row.new_data),
      },
    ];
  });
}

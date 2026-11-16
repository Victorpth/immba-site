import "server-only";

import { toAlumniRecord, type AlumniRecord, type AlumniWrite } from "@/lib/alumni-record";
import { createSupabaseServer } from "@/lib/supabase-server";

type WriteFailure = { ok: false; error: "duplicate_student_id" | "save_failed" | "not_found" };

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

export async function insertAlumni(value: AlumniWrite): Promise<{ ok: true; record: AlumniRecord } | WriteFailure> {
  if (await studentIdTaken(value.student_id)) return { ok: false, error: "duplicate_student_id" };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").insert(value).select().single();
  if (error || !data) return failure(error);
  const record = toAlumniRecord(data as Record<string, unknown>);
  if (!record) return { ok: false, error: "save_failed" };
  return { ok: true, record };
}

export async function updateAlumni(id: string, value: AlumniWrite): Promise<{ ok: true; record: AlumniRecord } | WriteFailure> {
  if (await studentIdTaken(value.student_id, id)) return { ok: false, error: "duplicate_student_id" };
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").update(value).eq("id", id).select().maybeSingle();
  if (error) return failure(error);
  if (!data) return { ok: false, error: "not_found" };
  const record = toAlumniRecord(data as Record<string, unknown>);
  if (!record) return { ok: false, error: "save_failed" };
  return { ok: true, record };
}

export async function deleteAlumni(id: string): Promise<{ ok: true } | WriteFailure> {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.from("alumni").delete().eq("id", id).select("id").maybeSingle();
  if (error) return failure(error);
  if (!data) return { ok: false, error: "not_found" };
  return { ok: true };
}

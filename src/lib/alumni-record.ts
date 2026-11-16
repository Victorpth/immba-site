export const degreePrograms = ["Bachelor", "Master", "Doctoral", "Other"] as const;

export type DegreeProgram = (typeof degreePrograms)[number];

export type AlumniRecord = {
  id: string;
  full_name: string;
  student_id: string;
  department: string;
  degree_program: DegreeProgram;
  admission_year: number | null;
  graduation_year: number | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  notes: string | null;
};

export type AlumniWrite = Omit<AlumniRecord, "id">;

export type AlumniAuditAction = "CREATE" | "UPDATE" | "DELETE" | "IMPORT";

export type AlumniAuditLog = {
  id: string;
  created_at: string;
  admin_email: string | null;
  action: AlumniAuditAction | string;
  record_label: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isAlumniId(value: string) {
  return uuidPattern.test(value);
}

function requiredText(value: unknown, max: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > max) return undefined;
  return trimmed;
}

function optionalText(value: unknown, max: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) return undefined;
  return trimmed;
}

function optionalYear(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const year = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) return undefined;
  return year;
}

export function parseAlumniWrite(body: unknown): { ok: true; value: AlumniWrite } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "invalid_request" };
  const record = body as Record<string, unknown>;

  const fullName = requiredText(record.full_name, 200);
  if (fullName === undefined) return { ok: false, error: "invalid_request" };
  if (!fullName) return { ok: false, error: "full_name_required" };

  const studentId = requiredText(record.student_id, 64);
  if (studentId === undefined) return { ok: false, error: "invalid_request" };
  if (!studentId) return { ok: false, error: "student_id_required" };

  const department = requiredText(record.department, 200);
  if (department === undefined) return { ok: false, error: "invalid_request" };
  if (!department) return { ok: false, error: "department_required" };

  if (typeof record.degree_program !== "string" || !degreePrograms.includes(record.degree_program as DegreeProgram)) {
    return { ok: false, error: "invalid_degree" };
  }

  const admissionYear = optionalYear(record.admission_year);
  const graduationYear = optionalYear(record.graduation_year);
  if (admissionYear === undefined || graduationYear === undefined) return { ok: false, error: "invalid_year" };

  const email = optionalText(record.email, 320);
  if (email === undefined) return { ok: false, error: "invalid_request" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "invalid_email" };

  const phone = optionalText(record.phone, 40);
  const company = optionalText(record.company, 200);
  const jobTitle = optionalText(record.job_title, 200);
  const notes = optionalText(record.notes, 4000);
  if (phone === undefined || company === undefined || jobTitle === undefined || notes === undefined) {
    return { ok: false, error: "invalid_request" };
  }

  return {
    ok: true,
    value: {
      full_name: fullName,
      student_id: studentId,
      department,
      degree_program: record.degree_program as DegreeProgram,
      admission_year: admissionYear,
      graduation_year: graduationYear,
      email,
      phone,
      company,
      job_title: jobTitle,
      notes,
    },
  };
}

export function toAlumniRecord(row: Record<string, unknown>): AlumniRecord | null {
  const id = typeof row.id === "string" ? row.id : "";
  const fullName = typeof row.full_name === "string" ? row.full_name : "";
  const studentId = typeof row.student_id === "string" ? row.student_id : "";
  const department = typeof row.department === "string" ? row.department : "";
  const degree = degreePrograms.includes(row.degree_program as DegreeProgram) ? (row.degree_program as DegreeProgram) : null;
  if (!isAlumniId(id) || !fullName || !studentId || !department || !degree) return null;
  const year = (value: unknown) => {
    if (typeof value === "number" && Number.isInteger(value)) return value;
    if (typeof value === "string" && /^\d{4}$/.test(value)) return Number(value);
    return null;
  };
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value : null);
  return {
    id,
    full_name: fullName,
    student_id: studentId,
    department,
    degree_program: degree,
    admission_year: year(row.admission_year),
    graduation_year: year(row.graduation_year),
    email: text(row.email),
    phone: text(row.phone),
    company: text(row.company),
    job_title: text(row.job_title),
    notes: text(row.notes),
  };
}

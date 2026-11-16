import * as PapaModule from "papaparse";
import type { ParseResult } from "papaparse";
import { degreePrograms, parseAlumniWrite, type AlumniWrite, type DegreeProgram } from "@/lib/alumni-record";

const requiredColumns = ["full_name", "student_id", "department", "degree_program"] as const;

const headerFields: Record<string, keyof AlumniWrite> = {
  full_name: "full_name",
  name: "full_name",
  student_id: "student_id",
  "student id": "student_id",
  department: "department",
  degree_program: "degree_program",
  "degree program": "degree_program",
  admission_year: "admission_year",
  "admission year": "admission_year",
  graduation_year: "graduation_year",
  "graduation year": "graduation_year",
  email: "email",
  phone: "phone",
  company: "company",
  "current company": "company",
  job_title: "job_title",
  "job title": "job_title",
  notes: "notes",
};

const degreeNames: Record<string, DegreeProgram> = {
  bachelor: "Bachelor",
  "bachelor's program": "Bachelor",
  master: "Master",
  "master's program": "Master",
  doctoral: "Doctoral",
  "doctoral program": "Doctoral",
  other: "Other",
};

export type CsvRowReport = {
  line: number;
  fullName: string;
  studentId: string;
  issues: string[];
  value: AlumniWrite | null;
};

export type CsvPreview = {
  fileIssues: string[];
  unknownColumns: string[];
  rows: CsvRowReport[];
};

function headerKey(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ");
}

function blankRow(row: string[]) {
  return row.every((cell) => !cell.trim());
}

function readCsv(text: string): ParseResult<string[]> {
  const source = PapaModule as typeof PapaModule & { default?: { parse?: typeof PapaModule.parse } };
  const parse = typeof source.parse === "function" ? source.parse : source.default?.parse;
  if (!parse) throw new Error("unreadable_csv");
  return parse<string[]>(text.replace(/^\uFEFF/, ""), {
    header: false,
    skipEmptyLines: false,
    delimiter: ",",
  });
}

function degreeValue(value: string) {
  const key = headerKey(value);
  return degreeNames[key] ?? value.trim();
}

function yearInvalid(value: string) {
  if (!value.trim()) return false;
  if (!/^\d+$/.test(value.trim())) return true;
  const year = Number(value);
  return year < 1900 || year > 2100;
}

function pushIssue(issues: string[], code: string) {
  if (!issues.includes(code)) issues.push(code);
}

function rowIssues(raw: Record<string, string>) {
  const issues: string[] = [];
  const fullName = raw.full_name.trim();
  const studentId = raw.student_id.trim();
  const department = raw.department.trim();
  const degree = degreeValue(raw.degree_program);
  if (!fullName) pushIssue(issues, "full_name_required");
  else if (fullName.length > 200) pushIssue(issues, "invalid_request");
  if (!studentId) pushIssue(issues, "student_id_required");
  else if (studentId.length > 64) pushIssue(issues, "invalid_request");
  if (!department) pushIssue(issues, "department_required");
  else if (department.length > 200) pushIssue(issues, "invalid_request");
  if (!degreePrograms.includes(degree as DegreeProgram)) pushIssue(issues, "invalid_degree");
  if (yearInvalid(raw.admission_year) || yearInvalid(raw.graduation_year)) pushIssue(issues, "invalid_year");
  const email = raw.email.trim();
  if (
    email.length > 320 ||
    raw.phone.trim().length > 40 ||
    raw.company.trim().length > 200 ||
    raw.job_title.trim().length > 200 ||
    raw.notes.trim().length > 4000
  ) {
    pushIssue(issues, "invalid_request");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) pushIssue(issues, "invalid_email");
  return issues;
}

export function parseAlumniCsv(text: string, existingStudentIds: Iterable<string>): CsvPreview {
  let parsed: ParseResult<string[]>;
  try {
    parsed = readCsv(text);
  } catch {
    return { fileIssues: ["unreadable_csv"], unknownColumns: [], rows: [] };
  }
  if (parsed.errors.some((error) => error.type === "Quotes")) {
    return { fileIssues: ["unreadable_csv"], unknownColumns: [], rows: [] };
  }

  const table = parsed.data.map((row) => (Array.isArray(row) ? row.map((cell) => String(cell ?? "")) : []));
  while (table.length > 0 && blankRow(table[table.length - 1] ?? [])) table.pop();
  if (table.length === 0) return { fileIssues: ["empty_file"], unknownColumns: [], rows: [] };

  const header = table[0] ?? [];
  const columns: { name: keyof AlumniWrite; index: number }[] = [];
  const seen = new Set<keyof AlumniWrite>();
  const unknownColumns: string[] = [];
  header.forEach((cell, index) => {
    const key = headerKey(cell);
    if (!key) return;
    const field = headerFields[key];
    if (!field) {
      unknownColumns.push(cell.trim());
      return;
    }
    if (seen.has(field)) return;
    seen.add(field);
    columns.push({ name: field, index });
  });

  const missing = requiredColumns.filter((name) => !seen.has(name));
  if (missing.length) {
    return { fileIssues: missing.map((name) => `missing_column:${name}`), unknownColumns, rows: [] };
  }

  const drafts: { line: number; raw: Record<string, string> }[] = [];
  table.slice(1).forEach((row, offset) => {
    if (blankRow(row)) return;
    const raw = {
      full_name: "",
      student_id: "",
      department: "",
      degree_program: "",
      admission_year: "",
      graduation_year: "",
      email: "",
      phone: "",
      company: "",
      job_title: "",
      notes: "",
    };
    for (const column of columns) raw[column.name] = (row[column.index] ?? "").trim();
    drafts.push({ line: offset + 2, raw });
  });

  if (drafts.length === 0) return { fileIssues: ["empty_file"], unknownColumns, rows: [] };
  if (drafts.length > 1000) return { fileIssues: ["too_many_rows"], unknownColumns, rows: [] };

  const repeats = new Map<string, number>();
  for (const draft of drafts) {
    const studentId = draft.raw.student_id.trim();
    if (!studentId) continue;
    repeats.set(studentId, (repeats.get(studentId) ?? 0) + 1);
  }
  const existing = new Set(existingStudentIds);

  const rows = drafts.map(({ line, raw }) => {
    const issues = rowIssues(raw);
    const studentId = raw.student_id.trim();
    if (studentId && (repeats.get(studentId) ?? 0) > 1) issues.push("duplicate_in_file");
    if (studentId && existing.has(studentId)) issues.push("duplicate_student_id");
    const payload = {
      ...raw,
      degree_program: degreeValue(raw.degree_program),
    };
    const parsedRow = parseAlumniWrite(payload);
    if (!parsedRow.ok && !issues.includes(parsedRow.error)) issues.push(parsedRow.error);
    return {
      line,
      fullName: raw.full_name.trim(),
      studentId,
      issues,
      value: issues.length === 0 && parsedRow.ok ? parsedRow.value : null,
    };
  });

  return { fileIssues: [], unknownColumns, rows };
}

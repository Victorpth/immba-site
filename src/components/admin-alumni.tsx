"use client";

import { parseAlumniCsv, type CsvPreview } from "@/lib/alumni-import";
import {
  degreePrograms,
  type AlumniAuditLog,
  type AlumniRecord,
  type AlumniWrite,
  type DegreeProgram,
} from "@/lib/alumni-record";
import { tx, type Lang } from "@/lib/i18n";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";
const primaryButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60";
const actionButton =
  "inline-flex h-10 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-ink hover:border-burgundy disabled:opacity-40";

const emptyForm = {
  full_name: "",
  student_id: "",
  department: "",
  degree_program: "" as "" | DegreeProgram,
  admission_year: "",
  graduation_year: "",
  email: "",
  phone: "",
  company: "",
  job_title: "",
  notes: "",
};

type FormState = typeof emptyForm;

const degreeLabel: Record<DegreeProgram, { en: string; zh: string }> = {
  Bachelor: { en: "Bachelor", zh: "學士" },
  Master: { en: "Master", zh: "碩士" },
  Doctoral: { en: "Doctoral", zh: "博士" },
  Other: { en: "Other", zh: "其他" },
};

const errorText: Record<string, { en: string; zh: string }> = {
  full_name_required: { en: "Add a full name.", zh: "請填寫姓名。" },
  student_id_required: { en: "Add a student ID.", zh: "請填寫學號。" },
  department_required: { en: "Add a department.", zh: "請填寫系所。" },
  invalid_degree: { en: "Choose Bachelor, Master, Doctoral, or Other.", zh: "請選擇學士、碩士、博士或其他。" },
  invalid_year: { en: "Enter a year between 1900 and 2100.", zh: "年份請介於 1900 與 2100。" },
  invalid_email: { en: "Enter a valid email address.", zh: "請輸入有效的電子郵件。" },
  duplicate_student_id: { en: "This student ID is already used.", zh: "這個學號已經存在。" },
  invalid_request: { en: "Check the form and try again.", zh: "請檢查表單後再試一次。" },
  not_found: { en: "That alumni record no longer exists.", zh: "找不到這筆校友資料。" },
  save_failed: { en: "The alumni record could not be saved.", zh: "校友資料無法儲存。" },
  audit_failed: {
    en: "The alumni record changed, but the activity log could not be written.",
    zh: "校友資料已變更，但無法寫入操作紀錄。",
  },
  load_failed: { en: "The alumni list could not be loaded.", zh: "校友名單無法載入。" },
  history_failed: { en: "The activity history could not be loaded.", zh: "操作紀錄無法載入。" },
  duplicate_in_file: { en: "This student ID is repeated in the file.", zh: "這個學號在檔案中重複。" },
  unreadable_csv: { en: "This file could not be read as CSV.", zh: "無法讀取這個 CSV 檔。" },
  empty_file: { en: "The file has no alumni rows to import.", zh: "檔案裡沒有可匯入的校友列。" },
  too_many_rows: { en: "The file has more than 1000 alumni rows.", zh: "檔案超過 1000 列校友。" },
  import_failed: { en: "The alumni file could not be imported.", zh: "校友檔案無法匯入。" },
  unauthorized: { en: "Sign in again to change alumni records.", zh: "請重新登入後再修改校友。" },
  forbidden: { en: "This account cannot change alumni records.", zh: "這個帳號不能修改校友。" },
};

function message(lang: Lang, code: string) {
  if (code.startsWith("missing_column:")) {
    const column = code.slice("missing_column:".length);
    return tx(lang, { en: `Missing required column: ${column}.`, zh: `缺少必填欄位：${column}。` });
  }
  return tx(lang, errorText[code] ?? { en: "Something went wrong.", zh: "發生錯誤。" });
}

function validEmail(value: string) {
  return value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toForm(person: AlumniRecord): FormState {
  return {
    full_name: person.full_name,
    student_id: person.student_id,
    department: person.department,
    degree_program: person.degree_program,
    admission_year: person.admission_year === null ? "" : String(person.admission_year),
    graduation_year: person.graduation_year === null ? "" : String(person.graduation_year),
    email: person.email ?? "",
    phone: person.phone ?? "",
    company: person.company ?? "",
    job_title: person.job_title ?? "",
    notes: person.notes ?? "",
  };
}

function toWrite(form: FormState): AlumniWrite {
  const blank = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };
  const year = (value: string) => (value.trim() ? Number(value) : null);
  return {
    full_name: form.full_name.trim(),
    student_id: form.student_id.trim(),
    department: form.department.trim(),
    degree_program: form.degree_program || "Bachelor",
    admission_year: year(form.admission_year),
    graduation_year: year(form.graduation_year),
    email: blank(form.email),
    phone: blank(form.phone),
    company: blank(form.company),
    job_title: blank(form.job_title),
    notes: blank(form.notes),
  };
}

const comparedFields = [
  "full_name",
  "student_id",
  "department",
  "degree_program",
  "admission_year",
  "graduation_year",
  "email",
  "phone",
  "company",
  "job_title",
  "notes",
];

function shownValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function changedFields(log: AlumniAuditLog) {
  if (log.action === "IMPORT") {
    const filename = typeof log.new_data?.filename === "string" ? log.new_data.filename : (log.record_label ?? "—");
    const count = log.new_data?.imported_count;
    const imported = typeof count === "number" ? String(count) : "—";
    return [`file : ${filename}`, `imported : ${imported}`];
  }
  if (log.action !== "UPDATE" || !log.old_data || !log.new_data) return [];
  const keys = [...comparedFields];
  for (const key of [...Object.keys(log.old_data), ...Object.keys(log.new_data)]) {
    if (!keys.includes(key) && key !== "id" && key !== "created_at" && key !== "updated_at") keys.push(key);
  }
  return keys.flatMap((key) => {
    const before = shownValue(log.old_data?.[key]);
    const after = shownValue(log.new_data?.[key]);
    if (before === after) return [];
    return [`${key} : ${before} → ${after}`];
  });
}

function formatWhen(lang: Lang, iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-TW" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const csvColumns = [
  "full_name",
  "student_id",
  "department",
  "degree_program",
  "admission_year",
  "graduation_year",
  "email",
  "phone",
  "company",
  "job_title",
  "notes",
] as const satisfies readonly (keyof AlumniRecord)[];

function csvCell(value: string) {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

function alumniCsv(rows: AlumniRecord[]) {
  const lines = [
    csvColumns.join(","),
    ...rows.map((person) =>
      csvColumns
        .map((key) => {
          const value = person[key];
          return csvCell(value === null ? "" : String(value));
        })
        .join(","),
    ),
  ];
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}

function exportFileName() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `alumni_export_${now.getFullYear()}-${month}-${day}.csv`;
}

const templateExample: Record<(typeof csvColumns)[number], string> = {
  full_name: "Example Name",
  student_id: "A12345678",
  department: "Business Administration",
  degree_program: "Master",
  admission_year: "2022",
  graduation_year: "2024",
  email: "example@example.com",
  phone: "0912345678",
  company: "Example Company",
  job_title: "Analyst",
  notes: "Replace this example row.",
};

function templateCsv() {
  const example = csvColumns.map((key) => csvCell(templateExample[key])).join(",");
  return `\uFEFF${csvColumns.join(",")}\r\n${example}\r\n`;
}

function downloadCsv(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function requestAlumni(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await response.json().catch(() => null)) as { error?: string } | AlumniRecord | { ok?: boolean } | null;
  if (!response.ok) {
    const code = body && "error" in body && typeof body.error === "string" ? body.error : "save_failed";
    throw new Error(code);
  }
  return body;
}

export function AdminAlumni({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<AlumniRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AlumniRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [degree, setDegree] = useState<"" | DegreeProgram>("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [company, setCompany] = useState("");
  const [view, setView] = useState<"records" | "history">("records");
  const [logs, setLogs] = useState<AlumniAuditLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importReport, setImportReport] = useState<(CsvPreview & { filename: string }) | null>(null);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    rejected: number;
    serverIssues: { line: number; error: string }[];
  } | null>(null);

  useEffect(() => {
    let active = true;
    requestAlumni("/api/alumni")
      .then((body) => {
        if (active) setItems(Array.isArray(body) ? body : []);
      })
      .catch((reason: unknown) => {
        if (active) setError(message(lang, reason instanceof Error ? reason.message : "load_failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lang]);

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return {
      years: unique(items.flatMap((person) => (person.graduation_year === null ? [] : [String(person.graduation_year)]))).sort(
        (a, b) => Number(b) - Number(a),
      ),
      departments: unique(items.map((person) => person.department)),
      companies: unique(items.flatMap((person) => (person.company ? [person.company] : []))),
    };
  }, [items]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((person) => {
      if (needle && !person.full_name.toLowerCase().includes(needle)) return false;
      if (degree && person.degree_program !== degree) return false;
      if (graduationYear && String(person.graduation_year ?? "") !== graduationYear) return false;
      if (department && person.department !== department) return false;
      if (company && person.company !== company) return false;
      return true;
    });
  }, [items, query, degree, graduationYear, department, company]);

  function resetFilters() {
    setQuery("");
    setDegree("");
    setGraduationYear("");
    setDepartment("");
    setCompany("");
  }

  function exportVisible() {
    downloadCsv(exportFileName(), alumniCsv(visible));
  }

  function downloadTemplate() {
    downloadCsv("alumni_import_template.csv", templateCsv());
  }

  async function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    setImportSummary(null);
    try {
      const text = await file.text();
      setImportReport({ filename: file.name, ...parseAlumniCsv(text, items.map((person) => person.student_id)) });
    } catch {
      setError(message(lang, "unreadable_csv"));
    }
  }

  async function confirmImport() {
    if (!importReport) return;
    const ready = importReport.rows.filter((row) => row.value);
    const rejectedBefore = importReport.rows.length - ready.length;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/alumni/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: importReport.filename,
          rows: ready.map((row) => ({ line: row.line, ...row.value })),
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        imported?: number;
        rejected?: { line: number; error: string }[];
      } | null;
      if (!response.ok && body?.error !== "audit_failed") {
        setError(message(lang, body?.error ?? "import_failed"));
        return;
      }
      const imported = typeof body?.imported === "number" ? body.imported : 0;
      const serverIssues = Array.isArray(body?.rejected) ? body.rejected : [];
      if (imported > 0) {
        try {
          await reload();
        } catch {
          setError(message(lang, "load_failed"));
        }
      }
      setImportSummary({ imported, rejected: rejectedBefore + serverIssues.length, serverIssues });
      setImportReport(null);
      if (body?.error === "audit_failed") setError(message(lang, "audit_failed"));
    } catch {
      setError(message(lang, "import_failed"));
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
    setNotice("");
  }

  function openEdit(person: AlumniRecord) {
    setEditingId(person.id);
    setForm(toForm(person));
    setShowForm(true);
    setError("");
    setNotice("");
  }

  function setField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function reload() {
    const body = await requestAlumni("/api/alumni");
    setItems(Array.isArray(body) ? body : []);
  }

  async function openHistory() {
    setView("history");
    setHistoryLoading(true);
    setError("");
    try {
      const body = await requestAlumni("/api/alumni/audit");
      setLogs(Array.isArray(body) ? body : []);
    } catch (reason) {
      setError(message(lang, reason instanceof Error ? reason.message : "history_failed"));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function afterAuditFailure() {
    try {
      await reload();
    } catch {
      setError(message(lang, "load_failed"));
    }
    setShowForm(false);
    setEditingId(null);
    setPendingDelete(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setError(message(lang, "full_name_required"));
      return;
    }
    if (!form.student_id.trim()) {
      setError(message(lang, "student_id_required"));
      return;
    }
    if (!form.department.trim()) {
      setError(message(lang, "department_required"));
      return;
    }
    if (!form.degree_program) {
      setError(message(lang, "invalid_degree"));
      return;
    }
    if (form.email.trim() && !validEmail(form.email.trim())) {
      setError(message(lang, "invalid_email"));
      return;
    }
    setSaving(true);
    setError("");
    try {
      await requestAlumni(editingId ? `/api/alumni/${editingId}` : "/api/alumni", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(toWrite(form)),
      });
      await reload();
      setShowForm(false);
      setEditingId(null);
      setNotice(tx(lang, { en: "Saved.", zh: "已儲存。" }));
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "save_failed";
      if (code === "audit_failed") await afterAuditFailure();
      setError(message(lang, code));
    } finally {
      setSaving(false);
    }
  }

  async function remove(person: AlumniRecord) {
    setSaving(true);
    setError("");
    try {
      await requestAlumni(`/api/alumni/${person.id}`, { method: "DELETE" });
      if (editingId === person.id) setShowForm(false);
      setPendingDelete(null);
      await reload();
      setNotice(tx(lang, { en: "Deleted.", zh: "已刪除。" }));
    } catch (reason) {
      const code = reason instanceof Error ? reason.message : "save_failed";
      if (code === "audit_failed") await afterAuditFailure();
      setError(message(lang, code));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="site-wrap py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("records")}
            className={view === "records" ? primaryButton : actionButton}
            aria-current={view === "records" ? "page" : undefined}
          >
            {tx(lang, { en: "Alumni", zh: "校友" })}
          </button>
          <button
            type="button"
            onClick={openHistory}
            className={view === "history" ? primaryButton : actionButton}
            aria-current={view === "history" ? "page" : undefined}
          >
            {tx(lang, { en: "Activity history", zh: "操作紀錄" })}
          </button>
        </div>
        <button type="button" onClick={openCreate} className={primaryButton}>
          {tx(lang, { en: "Add alumni", zh: "新增校友" })}
        </button>
      </div>
      {notice ? (
        <p className="mt-4 text-sm text-[#1d4f86]" role="status">
          {notice}
        </p>
      ) : null}
      {error && !showForm ? (
        <p className="mt-4 text-sm text-burgundy" role="alert">
          {error}
        </p>
      ) : null}

      {view === "history" ? (
        historyLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{tx(lang, { en: "Loading activity…", zh: "正在載入操作紀錄…" })}</p>
        ) : logs.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            {tx(lang, { en: "No activity has been recorded yet.", zh: "目前沒有操作紀錄。" })}
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-cream">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">{tx(lang, { en: "When", zh: "時間" })}</th>
                  <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Admin", zh: "管理員" })}</th>
                  <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Action", zh: "動作" })}</th>
                  <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Student ID", zh: "學號" })}</th>
                  <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Changes", zh: "變更" })}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const changes = changedFields(log);
                  return (
                    <tr key={log.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4 align-top whitespace-nowrap text-ink">{formatWhen(lang, log.created_at)}</td>
                      <td className="px-4 py-4 align-top text-ink">{log.admin_email ?? "—"}</td>
                      <td className="px-4 py-4 align-top font-semibold text-ink">{log.action}</td>
                      <td className="px-4 py-4 align-top text-ink">{log.record_label ?? "—"}</td>
                      <td className="px-4 py-4 align-top text-ink">
                        {changes.length === 0
                          ? "—"
                          : changes.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : loading ? (
        <p className="mt-8 text-sm text-muted-foreground">{tx(lang, { en: "Loading alumni…", zh: "正在載入校友…" })}</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Search by name", zh: "依姓名搜尋" })}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tx(lang, { en: "Name", zh: "姓名" })}
                className={fieldClass}
              />
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Degree", zh: "學位" })}
              <select value={degree} onChange={(event) => setDegree(event.target.value as "" | DegreeProgram)} className={fieldClass}>
                <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
                {degreePrograms.map((program) => (
                  <option key={program} value={program}>
                    {tx(lang, degreeLabel[program])}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Graduation year", zh: "畢業年" })}
              <select value={graduationYear} onChange={(event) => setGraduationYear(event.target.value)} className={fieldClass}>
                <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Department", zh: "系所" })}
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className={fieldClass}>
                <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
                {filterOptions.departments.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Company", zh: "公司" })}
              <select value={company} onChange={(event) => setCompany(event.target.value)} className={fieldClass}>
                <option value="">{tx(lang, { en: "All", zh: "全部" })}</option>
                {filterOptions.companies.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={resetFilters} className={actionButton}>
                {tx(lang, { en: "Reset filters", zh: "清除篩選" })}
              </button>
              <button type="button" onClick={exportVisible} className={actionButton}>
                {tx(lang, { en: "Export CSV", zh: "匯出 CSV" })}
              </button>
              <button type="button" onClick={downloadTemplate} className={actionButton}>
                {tx(lang, { en: "Download CSV template", zh: "下載 CSV 範本" })}
              </button>
              <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={onPickFile} />
              <button type="button" onClick={() => fileInput.current?.click()} className={actionButton}>
                {tx(lang, { en: "Import CSV", zh: "匯入 CSV" })}
              </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {tx(lang, {
              en: `${visible.length} of ${items.length} alumni`,
              zh: `${visible.length} / ${items.length} 位校友`,
            })}
          </p>
          {visible.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? tx(lang, { en: "No alumni are listed yet.", zh: "目前沒有校友資料。" })
                : tx(lang, { en: "No alumni match these filters.", zh: "沒有符合這些條件的校友。" })}
            </p>
          ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-cream">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Name", zh: "姓名" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Student ID", zh: "學號" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Department", zh: "系所" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Degree", zh: "學位" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Years", zh: "年份" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Work", zh: "工作" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Contact", zh: "聯絡" })}</th>
                <th className="px-4 py-3 font-semibold">{tx(lang, { en: "Actions", zh: "操作" })}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((person) => (
                <tr key={person.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-4 align-top font-semibold text-ink">{person.full_name}</td>
                  <td className="px-4 py-4 align-top text-ink">{person.student_id}</td>
                  <td className="px-4 py-4 align-top text-ink">{person.department}</td>
                  <td className="px-4 py-4 align-top text-ink">{tx(lang, degreeLabel[person.degree_program])}</td>
                  <td className="px-4 py-4 align-top text-ink">
                    {person.admission_year ?? "—"} – {person.graduation_year ?? "—"}
                  </td>
                  <td className="px-4 py-4 align-top text-ink">
                    {person.company || person.job_title ? (
                      <>
                        {person.job_title ? <span className="block">{person.job_title}</span> : null}
                        {person.company ? <span className="block text-muted-foreground">{person.company}</span> : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 align-top text-ink">
                    {person.email ? <span className="block">{person.email}</span> : null}
                    {person.phone ? <span className="block">{person.phone}</span> : null}
                    {!person.email && !person.phone ? "—" : null}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => openEdit(person)} className={actionButton}>
                        {tx(lang, { en: "Edit", zh: "編輯" })}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(person)}
                        className="inline-flex h-10 items-center rounded-full border border-burgundy/30 bg-white px-4 text-sm font-semibold text-burgundy hover:border-burgundy"
                      >
                        {tx(lang, { en: "Delete", zh: "刪除" })}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#121a27]/45 p-4 sm:items-center">
          <form
            onSubmit={onSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="alumni-editor-title"
            className="my-auto w-full max-w-3xl rounded-2xl border border-border bg-cream p-5 shadow-xl sm:p-6"
          >
            <h2 id="alumni-editor-title" className="text-3xl text-ink">
              {editingId ? tx(lang, { en: "Edit alumni", zh: "編輯校友" }) : tx(lang, { en: "New alumni", zh: "新增校友" })}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Full name", zh: "姓名" })} *
                <input required value={form.full_name} onChange={(event) => setField("full_name", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Student ID", zh: "學號" })} *
                <input required value={form.student_id} onChange={(event) => setField("student_id", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Department", zh: "系所" })} *
                <input required value={form.department} onChange={(event) => setField("department", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Degree program", zh: "學位" })} *
                <select
                  required
                  value={form.degree_program}
                  onChange={(event) => setField("degree_program", event.target.value)}
                  className={fieldClass}
                >
                  <option value="">{tx(lang, { en: "Choose", zh: "請選擇" })}</option>
                  {degreePrograms.map((program) => (
                    <option key={program} value={program}>
                      {tx(lang, degreeLabel[program])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Admission year", zh: "入學年" })}
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.admission_year}
                  onChange={(event) => setField("admission_year", event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Graduation year", zh: "畢業年" })}
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.graduation_year}
                  onChange={(event) => setField("graduation_year", event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Email", zh: "電子郵件" })}
                <input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Phone", zh: "電話" })}
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Company", zh: "公司" })}
                <input value={form.company} onChange={(event) => setField("company", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink">
                {tx(lang, { en: "Job title", zh: "職稱" })}
                <input value={form.job_title} onChange={(event) => setField("job_title", event.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-semibold text-ink sm:col-span-2">
                {tx(lang, { en: "Notes", zh: "備註" })}
                <textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} rows={3} className={fieldClass} />
              </label>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-burgundy" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={saving} className={primaryButton}>
                {tx(lang, { en: "Save alumni", zh: "儲存校友" })}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
              >
                {tx(lang, { en: "Cancel", zh: "取消" })}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {importReport ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#121a27]/45 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-alumni-title"
            className="my-auto w-full max-w-3xl rounded-2xl border border-border bg-cream p-5 shadow-xl sm:p-6"
          >
            <h2 id="import-alumni-title" className="text-3xl text-ink">
              {tx(lang, { en: "Import CSV", zh: "匯入 CSV" })}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{importReport.filename}</p>
            {importReport.fileIssues.length > 0 ? (
              <div className="mt-4 space-y-1 text-sm text-burgundy" role="alert">
                {importReport.fileIssues.map((code) => (
                  <p key={code}>{message(lang, code)}</p>
                ))}
              </div>
            ) : null}
            {importReport.unknownColumns.length > 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {tx(lang, {
                  en: `Unrecognized columns were ignored: ${importReport.unknownColumns.join(", ")}.`,
                  zh: `已略過未識別的欄位：${importReport.unknownColumns.join("、")}。`,
                })}
              </p>
            ) : null}
            {importReport.rows.length > 0 ? (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  {tx(lang, {
                    en: `${importReport.rows.filter((row) => row.value).length} ready, ${importReport.rows.filter((row) => !row.value).length} rejected`,
                    zh: `${importReport.rows.filter((row) => row.value).length} 筆可匯入，${importReport.rows.filter((row) => !row.value).length} 筆已拒絕`,
                  })}
                </p>
                <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-border bg-white p-4 text-sm">
                  {importReport.rows.map((row) => (
                    <li key={row.line} className={row.value ? "text-ink" : "text-burgundy"}>
                      <span className="font-semibold">
                        {tx(lang, { en: `Line ${row.line}`, zh: `第 ${row.line} 列` })}
                        {" · "}
                        {row.studentId || "—"}
                        {" · "}
                        {row.fullName || "—"}
                      </span>
                      <span className="mt-1 block">
                        {row.issues.length === 0
                          ? tx(lang, { en: "Ready to import.", zh: "可以匯入。" })
                          : row.issues.map((code) => message(lang, code)).join(" ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {importReport.fileIssues.length === 0 && importReport.rows.some((row) => row.value) ? (
                <button type="button" disabled={saving} onClick={confirmImport} className={primaryButton}>
                  {importReport.rows.some((row) => !row.value)
                    ? tx(lang, { en: "Import valid rows only", zh: "只匯入有效的列" })
                    : tx(lang, { en: "Import", zh: "匯入" })}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setImportReport(null)}
                className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
              >
                {tx(lang, { en: "Cancel", zh: "取消" })}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {importSummary ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121a27]/45 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="import-summary-title" className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <h2 id="import-summary-title" className="text-2xl text-ink">
              {tx(lang, { en: "Import complete", zh: "匯入完成" })}
            </h2>
            <p className="mt-3 text-sm font-medium text-ink">
              {tx(lang, {
                en: `${importSummary.imported} imported, ${importSummary.rejected} rejected.`,
                zh: `已匯入 ${importSummary.imported} 筆，已拒絕 ${importSummary.rejected} 筆。`,
              })}
            </p>
            {importSummary.serverIssues.length > 0 ? (
              <ul className="mt-4 max-h-60 space-y-2 overflow-y-auto text-sm text-burgundy">
                {importSummary.serverIssues.map((issue) => (
                  <li key={`${issue.line}-${issue.error}`}>
                    {tx(lang, { en: `Line ${issue.line}`, zh: `第 ${issue.line} 列` })}: {message(lang, issue.error)}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-6">
              <button type="button" onClick={() => setImportSummary(null)} className={primaryButton}>
                {tx(lang, { en: "Close", zh: "關閉" })}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121a27]/45 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-alumni-title" className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <h2 id="delete-alumni-title" className="text-2xl text-ink">
              {tx(lang, { en: "Delete this alumni record?", zh: "刪除這筆校友資料？" })}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, { en: "This removes the person from the alumni table.", zh: "這會從校友資料表移除這個人。" })}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">{pendingDelete.full_name}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" disabled={saving} onClick={() => remove(pendingDelete)} className={primaryButton}>
                {tx(lang, { en: "Delete alumni", zh: "刪除校友" })}
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
              >
                {tx(lang, { en: "Cancel", zh: "取消" })}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

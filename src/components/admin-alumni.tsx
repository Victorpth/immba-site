"use client";

import {
  degreePrograms,
  type AlumniAuditLog,
  type AlumniRecord,
  type AlumniWrite,
  type DegreeProgram,
} from "@/lib/alumni-record";
import { tx, type Lang } from "@/lib/i18n";
import { FormEvent, useEffect, useState } from "react";

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
  unauthorized: { en: "Sign in again to change alumni records.", zh: "請重新登入後再修改校友。" },
  forbidden: { en: "This account cannot change alumni records.", zh: "這個帳號不能修改校友。" },
};

function message(lang: Lang, code: string) {
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
  const [view, setView] = useState<"records" | "history">("records");
  const [logs, setLogs] = useState<AlumniAuditLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      ) : items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {tx(lang, { en: "No alumni are listed yet.", zh: "目前沒有校友資料。" })}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-cream">
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
              {items.map((person) => (
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

"use client";

import { TextLink } from "@/components/site-links";
import { type FacultyCategory, type FacultyRecord, type FacultyWrite } from "@/lib/faculty-record";
import { tx, withLang, type Lang } from "@/lib/i18n";
import { FormEvent, useEffect, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

const emptyForm = {
  name: "",
  title: "",
  education: "",
  research_fields: "",
  email: "",
  phone: "",
  website: "",
  image_url: "",
  category: "" as "" | FacultyCategory,
  sort_order: "0",
};

type FormState = typeof emptyForm;

const errorText: Record<string, { en: string; zh: string }> = {
  name_required: { en: "Add a name.", zh: "請填寫姓名。" },
  invalid_category: { en: "Choose full-time, visiting, or adjunct.", zh: "請選擇專任、客座或兼任。" },
  invalid_request: { en: "Check the form and try again.", zh: "請檢查表單後再試一次。" },
  not_found: { en: "That faculty record no longer exists.", zh: "找不到這筆師資資料。" },
  save_failed: { en: "The faculty record could not be saved.", zh: "師資資料無法儲存。" },
  load_failed: { en: "The faculty list could not be loaded.", zh: "師資名單無法載入。" },
};

function message(lang: Lang, code: string) {
  return tx(lang, errorText[code] ?? { en: "Something went wrong.", zh: "發生錯誤。" });
}

function toForm(person: FacultyRecord): FormState {
  return {
    name: person.name,
    title: person.title ?? "",
    education: person.education ?? "",
    research_fields: person.research_fields ?? "",
    email: person.email ?? "",
    phone: person.phone ?? "",
    website: person.website ?? "",
    image_url: person.image_url ?? "",
    category: person.category ?? "",
    sort_order: String(person.sort_order),
  };
}

function toWrite(form: FormState): FacultyWrite {
  const blank = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };
  return {
    name: form.name.trim(),
    title: blank(form.title),
    education: blank(form.education),
    research_fields: blank(form.research_fields),
    email: blank(form.email),
    phone: blank(form.phone),
    website: blank(form.website),
    image_url: blank(form.image_url),
    category: form.category || null,
    sort_order: Number(form.sort_order),
  };
}

async function requestFaculty(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = (await response.json().catch(() => null)) as { error?: string } | FacultyRecord | { ok?: boolean } | null;
  if (!response.ok) {
    const code = body && "error" in body && typeof body.error === "string" ? body.error : "save_failed";
    throw new Error(code);
  }
  return body;
}

export function AdminFaculty({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<FacultyRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FacultyRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const body = await requestFaculty("/api/faculty");
    setItems(Array.isArray(body) ? body : []);
  }

  useEffect(() => {
    let active = true;
    requestFaculty("/api/faculty")
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
    const nextOrder = items.length ? Math.max(...items.map((item) => item.sort_order)) + 1 : 1;
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: String(nextOrder) });
    setShowForm(true);
    setError("");
    setNotice("");
  }

  function openEdit(person: FacultyRecord) {
    setEditingId(person.id);
    setForm(toForm(person));
    setShowForm(true);
    setError("");
    setNotice("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await requestFaculty(editingId ? `/api/faculty/${editingId}` : "/api/faculty", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(toWrite(form)),
      });
      await reload();
      setShowForm(false);
      setEditingId(null);
      setNotice(tx(lang, { en: "Saved.", zh: "已儲存。" }));
    } catch (reason) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(person: FacultyRecord) {
    setSaving(true);
    setError("");
    try {
      await requestFaculty(`/api/faculty/${person.id}`, { method: "DELETE" });
      if (editingId === person.id) setShowForm(false);
      setPendingDelete(null);
      await reload();
      setNotice(tx(lang, { en: "Deleted.", zh: "已刪除。" }));
    } catch (reason) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setSaving(false);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const ids = items.map((item) => item.id);
    const [id] = ids.splice(index, 1);
    ids.splice(nextIndex, 0, id);
    setSaving(true);
    setError("");
    try {
      await requestFaculty("/api/faculty/reorder", { method: "PUT", body: JSON.stringify({ ids }) });
      await reload();
    } catch (reason) {
      setError(message(lang, reason instanceof Error ? reason.message : "save_failed"));
    } finally {
      setSaving(false);
    }
  }

  function setField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="site-wrap py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TextLink href={withLang(lang, "/faculty")}>{tx(lang, { en: "View the public faculty page", zh: "查看公開師資頁" })}</TextLink>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85"
        >
          {tx(lang, { en: "New faculty member", zh: "新增師資" })}
        </button>
      </div>
      {notice ? <p className="mt-4 text-sm text-[#1d4f86]">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm text-burgundy">{error}</p> : null}

      {showForm ? (
        <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-border bg-cream p-5 sm:p-6">
          <h2 className="text-3xl text-ink">
            {editingId
              ? tx(lang, { en: "Edit faculty member", zh: "編輯師資" })
              : tx(lang, { en: "New faculty member", zh: "新增師資" })}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Name", zh: "姓名" })}
              <input required value={form.name} onChange={(event) => setField("name", event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Title", zh: "職稱" })}
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              {tx(lang, { en: "Education", zh: "學歷" })}
              <input value={form.education} onChange={(event) => setField("education", event.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink sm:col-span-2">
              {tx(lang, { en: "Research fields", zh: "研究領域" })}
              <textarea
                value={form.research_fields}
                onChange={(event) => setField("research_fields", event.target.value)}
                rows={3}
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
              {tx(lang, { en: "Website", zh: "網站" })}
              <input value={form.website} onChange={(event) => setField("website", event.target.value)} placeholder="https://" className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Photo URL", zh: "照片網址" })}
              <input value={form.image_url} onChange={(event) => setField("image_url", event.target.value)} placeholder="https://" className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Category", zh: "類別" })}
              <select
                value={form.category}
                onChange={(event) => setField("category", event.target.value)}
                className={fieldClass}
              >
                <option value="">{tx(lang, { en: "Not set", zh: "未設定" })}</option>
                <option value="full-time">{tx(lang, { en: "Full-time", zh: "專任" })}</option>
                <option value="visiting">{tx(lang, { en: "Visiting", zh: "客座" })}</option>
                <option value="adjunct">{tx(lang, { en: "Adjunct", zh: "兼任" })}</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              {tx(lang, { en: "Display order", zh: "顯示順序" })}
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => setField("sort_order", event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60"
            >
              {tx(lang, { en: "Save faculty member", zh: "儲存師資" })}
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
      ) : null}

      <h2 className="mt-10 text-3xl text-ink">{tx(lang, { en: "All faculty", zh: "全部師資" })}</h2>
      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">{tx(lang, { en: "Loading faculty…", zh: "正在載入師資…" })}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map((person, index) => (
            <li key={person.id} className="rounded-2xl border border-border bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {tx(lang, { en: "Order", zh: "順序" })} {person.sort_order}
                    {person.category ? ` · ${tx(lang, { en: person.category, zh: person.category === "full-time" ? "專任" : person.category === "visiting" ? "客座" : "兼任" })}` : ""}
                  </p>
                  <p className="mt-2 text-lg leading-snug text-ink">{person.name}</p>
                  {person.title ? <p className="mt-1 text-sm text-muted-foreground">{person.title}</p> : null}
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    disabled={saving || index === 0}
                    onClick={() => move(index, -1)}
                    className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86] disabled:opacity-40"
                  >
                    {tx(lang, { en: "Move up", zh: "上移" })}
                  </button>
                  <button
                    type="button"
                    disabled={saving || index === items.length - 1}
                    onClick={() => move(index, 1)}
                    className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86] disabled:opacity-40"
                  >
                    {tx(lang, { en: "Move down", zh: "下移" })}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(person)}
                    className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
                  >
                    {tx(lang, { en: "Edit", zh: "編輯" })}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(person)}
                    className="text-sm font-semibold text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:decoration-burgundy"
                  >
                    {tx(lang, { en: "Delete", zh: "刪除" })}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121a27]/45 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-faculty-title" className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <h2 id="delete-faculty-title" className="text-2xl text-ink">
              {tx(lang, { en: "Delete this faculty member?", zh: "刪除這位師資？" })}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "This removes the person from the public faculty page.",
                zh: "這會從公開師資頁移除這位教師。",
              })}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">{pendingDelete.name}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => remove(pendingDelete)}
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/85 disabled:opacity-60"
              >
                {tx(lang, { en: "Delete faculty member", zh: "刪除師資" })}
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

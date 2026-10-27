"use client";

import { AnnouncementCard } from "@/components/announcement-card";
import { TextLink } from "@/components/site-links";
import {
  isSynchronized,
  sortAnnouncements,
  type Announcement,
  type AnnouncementStatus,
  type AnnouncementSync,
} from "@/content/announcements";
import { useAnnouncements, writeAnnouncements } from "@/lib/announcement-store";
import { formatDate, tx, withLang, type Lang } from "@/lib/i18n";
import { translateTexts } from "@/lib/translate-client";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";

type Locks = Record<Lang, { title: boolean; content: boolean }>;

function other(lang: Lang): Lang {
  return lang === "en" ? "zh" : "en";
}

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode"));
      image.onload = () => {
        const maxEdge = 1200;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas"));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function SyncNote({ item, lang }: { item: Pick<Announcement, "title" | "content" | "sync">; lang: Lang }) {
  const synced = isSynchronized(item);
  return (
    <p className={`text-sm font-semibold ${synced ? "text-[#1d4f86]" : "text-burgundy"}`}>
      {synced
        ? tx(lang, { en: "Synchronized", zh: "已同步" })
        : tx(lang, { en: "Not synchronized", zh: "尚未同步" })}
      <span className="mt-1 block font-normal text-muted-foreground">
        {synced
          ? tx(lang, {
              en: "Chinese and English still match the latest aligned version.",
              zh: "中文與英文仍與最近一次對齊的版本相符。",
            })
          : tx(lang, {
              en: "One language changed after translation, or a title or the content is still empty. Preview both versions before you publish.",
              zh: "其中一種語言在翻譯後又被修改，或標題、內容仍有空白。發布前請預覽兩邊。",
            })}
      </span>
    </p>
  );
}

function AnnouncementEditor({
  lang,
  draft,
  setDraft,
  onCancel,
  onSave,
}: {
  lang: Lang;
  draft: Announcement;
  setDraft: (next: Announcement | ((current: Announcement) => Announcement)) => void;
  onCancel: () => void;
  onSave: (item: Announcement) => void;
}) {
  const [sourceLang, setSourceLang] = useState<Lang>("zh");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [tick, setTick] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");
  const [error, setError] = useState("");
  const [manual, setManual] = useState<Locks>({
    en: { title: false, content: false },
    zh: { title: false, content: false },
  });
  const draftRef = useRef(draft);
  const manualRef = useRef(manual);
  const sourceRef = useRef(sourceLang);
  const autoRef = useRef(autoTranslate);
  const forceRef = useRef(false);
  const requestRef = useRef(0);
  const translatedSignature = useRef("");
  const setDraftRef = useRef(setDraft);
  const langRef = useRef(lang);
  draftRef.current = draft;
  manualRef.current = manual;
  sourceRef.current = sourceLang;
  autoRef.current = autoTranslate;
  setDraftRef.current = setDraft;
  langRef.current = lang;

  useEffect(() => {
    if (tick === 0) return;
    const requestId = ++requestRef.current;
    const timer = window.setTimeout(() => {
      const source = sourceRef.current;
      const target = other(source);
      const force = forceRef.current;
      forceRef.current = false;
      if (!autoRef.current && !force) return;
      const current = draftRef.current;
      const sourceTitle = current.title[source];
      const sourceContent = current.content[source];
      if (!sourceTitle.trim() && !sourceContent.trim()) return;
      const signature = `${source}\n${sourceTitle}\n${sourceContent}`;
      if (!force && translatedSignature.current === signature) return;
      translatedSignature.current = signature;
      setTranslating(true);
      setTranslateError("");
      translateTexts([sourceTitle, sourceContent], source, target)
        .then(([title, content]) => {
          if (requestId !== requestRef.current) return;
          const locks = manualRef.current[target];
          const sync: AnnouncementSync = {
            source,
            sourceTitle,
            sourceContent,
            targetTitle: title,
            targetContent: content,
          };
          setDraftRef.current((item) => {
            if (item.title[source] !== sourceTitle || item.content[source] !== sourceContent) return item;
            return {
              ...item,
              title: { ...item.title, [target]: force || !locks.title ? title : item.title[target] },
              content: { ...item.content, [target]: force || !locks.content ? content : item.content[target] },
              sync,
            };
          });
          if (force) {
            setManual((currentLocks) => ({ ...currentLocks, [target]: { title: false, content: false } }));
          }
        })
        .catch(() => {
          if (requestId !== requestRef.current) return;
          setTranslateError(
            tx(langRef.current, {
              en: "Automatic translation is unavailable. Type the other language yourself.",
              zh: "目前無法自動翻譯，請自行輸入另一種語言。",
            }),
          );
        })
        .finally(() => {
          if (requestId === requestRef.current) setTranslating(false);
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [tick]);

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(tx(lang, { en: "Choose an image file.", zh: "請選擇圖片檔案。" }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError(tx(lang, { en: "This photo is too large. Choose one under 8 MB.", zh: "照片太大，請選擇 8 MB 以下的檔案。" }));
      return;
    }
    try {
      const imageUrl = await compressPhoto(file);
      if (imageUrl.length > 700_000) {
        setError(
          tx(lang, {
            en: "This photo is still too large to store. Choose a smaller one.",
            zh: "這張照片壓縮後仍然太大，請改用較小的照片。",
          }),
        );
        return;
      }
      setDraft((item) => ({ ...item, imageUrl }));
      setError("");
    } catch {
      setError(tx(lang, { en: "This photo could not be read. Try a JPEG or PNG.", zh: "無法讀取這張照片，請改用 JPEG 或 PNG。" }));
    }
  }

  function setText(language: Lang, field: "title" | "content", value: string) {
    setDraft((item) => ({ ...item, [field]: { ...item[field], [language]: value } }));
    setManual((current) => ({
      ...current,
      [language]: { ...current[language], [field]: language !== sourceLang },
    }));
    if (language === sourceLang && autoTranslate) setTick((count) => count + 1);
    setError("");
  }

  function markSynchronized() {
    const source = sourceLang;
    const target = other(source);
    setDraft((item) => ({
      ...item,
      sync: {
        source,
        sourceTitle: item.title[source],
        sourceContent: item.content[source],
        targetTitle: item.title[target],
        targetContent: item.content[target],
      },
    }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const link = draft.linkUrl.trim();
    if (!draft.date) {
      setError(tx(lang, { en: "Add a date.", zh: "請填寫日期。" }));
      return;
    }
    if (link && !/^https?:\/\//i.test(link) && !link.startsWith("/")) {
      setError(tx(lang, { en: "The link must start with http://, https://, or /.", zh: "連結請以 http://、https:// 或 / 開頭。" }));
      return;
    }
    const ready =
      draft.title.en.trim() && draft.title.zh.trim() && draft.content.en.trim() && draft.content.zh.trim();
    if (draft.status === "published" && !ready) {
      setError(
        tx(lang, {
          en: "Publish needs a Chinese title, an English title, and content in both languages.",
          zh: "發布時需要中文標題、英文標題，以及兩邊的內容。",
        }),
      );
      return;
    }
    if (!draft.title.en.trim() && !draft.title.zh.trim()) {
      setError(tx(lang, { en: "Add a title in at least one language.", zh: "請至少輸入一種語言的標題。" }));
      return;
    }
    onSave({ ...draft, linkUrl: link, order: Number.isFinite(draft.order) ? draft.order : 0 });
  }

  const versionsComplete = Boolean(
    draft.title.en.trim() && draft.title.zh.trim() && draft.content.en.trim() && draft.content.zh.trim(),
  );

  return (
    <form id="admin-news-form" onSubmit={onSubmit} className="rounded-2xl border border-border bg-cream p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-3xl text-ink">
          {tx(lang, { en: "One announcement, both languages", zh: "一則公告，兩種語言" })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {translating
            ? tx(lang, { en: "Translating…", zh: "翻譯中…" })
            : tx(lang, { en: "Chinese and English save together.", zh: "中文與英文會一起儲存。" })}
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Date", zh: "日期" })}
          <input
            type="date"
            required
            value={draft.date}
            onChange={(event) => setDraft((item) => ({ ...item, date: event.target.value }))}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2 lg:col-span-1">
          {tx(lang, { en: "Link URL", zh: "連結網址" })}
          <input
            type="text"
            value={draft.linkUrl}
            onChange={(event) => setDraft((item) => ({ ...item, linkUrl: event.target.value }))}
            placeholder="https://"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Display order", zh: "顯示順序" })}
          <input
            type="number"
            value={draft.order}
            onChange={(event) => setDraft((item) => ({ ...item, order: Number(event.target.value) }))}
            className={fieldClass}
          />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {tx(lang, { en: "Lower numbers appear first.", zh: "數字越小越前面。" })}
          </span>
        </label>
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Status", zh: "狀態" })}
          <select
            value={draft.status}
            onChange={(event) =>
              setDraft((item) => ({ ...item, status: event.target.value as AnnouncementStatus }))
            }
            className={fieldClass}
          >
            <option value="published">{tx(lang, { en: "Published", zh: "已發布" })}</option>
            <option value="draft">{tx(lang, { en: "Draft", zh: "草稿" })}</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold text-ink">
          {tx(lang, { en: "Photo", zh: "照片" })}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPhoto} className={`${fieldClass} file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-3 file:py-1 file:text-sm file:font-semibold file:text-ink`} />
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {tx(lang, { en: "Optional. The photo appears on this announcement.", zh: "選填。照片會顯示在這則公告上。" })}
          </span>
        </label>
        {draft.imageUrl ? (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <img src={draft.imageUrl} alt="" className="h-28 w-44 rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => setDraft((item) => ({ ...item, imageUrl: "" }))}
              className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
            >
              {tx(lang, { en: "Remove photo", zh: "移除照片" })}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-paper px-4 py-3">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            checked={autoTranslate}
            onChange={(event) => setAutoTranslate(event.target.checked)}
            className="size-4 accent-[#6e243c]"
          />
          {tx(lang, { en: "Automatic translation", zh: "自動翻譯" })}
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          {tx(lang, { en: "Translate from", zh: "翻譯來源" })}
          <select
            value={sourceLang}
            onChange={(event) => setSourceLang(event.target.value as Lang)}
            className="rounded-lg border border-input bg-white px-2 py-1 text-sm outline-none focus:border-burgundy"
          >
            <option value="zh">{tx(lang, { en: "Chinese", zh: "中文" })}</option>
            <option value="en">{tx(lang, { en: "English", zh: "英文" })}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            forceRef.current = true;
            setTick((count) => count + 1);
          }}
          className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
        >
          {tx(lang, { en: "Translate again", zh: "重新翻譯" })}
        </button>
        <p className="text-sm text-muted-foreground">
          {tx(lang, {
            en: "The other language fills in automatically. You can edit either side before saving.",
            zh: "另一種語言會自動填入，儲存前兩邊都可以再改。",
          })}
        </p>
      </div>
      {translateError ? <p className="mt-3 text-sm text-burgundy">{translateError}</p> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <fieldset className="rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold tracking-[0.14em] text-burgundy uppercase">中文</legend>
          <label className="mt-2 block text-sm font-semibold text-ink">
            {tx(lang, { en: "Chinese title", zh: "中文標題" })}
            <input
              value={draft.title.zh}
              onChange={(event) => setText("zh", "title", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            {tx(lang, { en: "Chinese content", zh: "中文內容" })}
            <textarea
              value={draft.content.zh}
              onChange={(event) => setText("zh", "content", event.target.value)}
              rows={5}
              className={fieldClass}
            />
          </label>
        </fieldset>
        <fieldset className="rounded-2xl border border-border p-4">
          <legend className="px-1 text-sm font-semibold tracking-[0.14em] text-burgundy uppercase">English</legend>
          <label className="mt-2 block text-sm font-semibold text-ink">
            {tx(lang, { en: "English title", zh: "英文標題" })}
            <input
              value={draft.title.en}
              onChange={(event) => setText("en", "title", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            {tx(lang, { en: "English content", zh: "英文內容" })}
            <textarea
              value={draft.content.en}
              onChange={(event) => setText("en", "content", event.target.value)}
              rows={5}
              className={fieldClass}
            />
          </label>
        </fieldset>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="text-2xl text-ink">{tx(lang, { en: "Preview", zh: "預覽" })}</h3>
          {!isSynchronized(draft) && versionsComplete ? (
            <button
              type="button"
              onClick={markSynchronized}
              className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
            >
              {tx(lang, { en: "Mark both versions as synchronized", zh: "將兩邊標示為已同步" })}
            </button>
          ) : null}
        </div>
        <div className="mt-3">
          <SyncNote item={draft} lang={lang} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">中文</p>
            <AnnouncementCard item={draft} lang="zh" />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">English</p>
            <AnnouncementCard item={draft} lang="en" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {draft.status === "published"
            ? tx(lang, {
                en: "Published announcements appear on the public site in the language the visitor selected.",
                zh: "已發布的公告會出現在公開網站，並依訪客選擇的語言顯示。",
              })
            : tx(lang, {
                en: "Drafts stay off the public site until you publish them.",
                zh: "草稿不會出現在公開網站，發布後才會顯示。",
              })}
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-burgundy">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={translating}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 disabled:opacity-60"
        >
          {tx(lang, { en: "Save announcement", zh: "儲存公告" })}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
        >
          {tx(lang, { en: "Cancel", zh: "取消" })}
        </button>
      </div>
    </form>
  );
}

export function AdminNewsManager({ lang }: { lang: Lang }) {
  const items = sortAnnouncements(useAnnouncements());
  const [draft, setDraft] = useState<Announcement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Announcement | null>(null);
  const [notice, setNotice] = useState("");

  function openCreate() {
    const nextOrder = items.length ? Math.min(...items.map((item) => item.order)) - 1 : 1;
    setNotice("");
    setDraft({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      linkUrl: "",
      imageUrl: "",
      order: nextOrder,
      status: "draft",
      title: { en: "", zh: "" },
      content: { en: "", zh: "" },
      sync: null,
    });
  }

  function openEdit(item: Announcement) {
    setNotice("");
    setDraft({
      ...item,
      title: { ...item.title },
      content: { ...item.content },
      sync: item.sync ? { ...item.sync } : null,
    });
  }

  function save(item: Announcement) {
    const next = items.some((current) => current.id === item.id)
      ? items.map((current) => (current.id === item.id ? item : current))
      : [...items, item];
    try {
      writeAnnouncements(next);
    } catch {
      setNotice(
        tx(lang, {
          en: "The announcement could not be saved. The photo may be too large for this browser.",
          zh: "公告無法儲存。照片可能太大，超過這個瀏覽器的容量。",
        }),
      );
      return;
    }
    setDraft(null);
    setNotice(tx(lang, { en: "Saved. Both languages are stored as one announcement.", zh: "已儲存。中文與英文存在同一則公告。" }));
  }

  function remove(item: Announcement) {
    writeAnnouncements(items.filter((current) => current.id !== item.id));
    if (draft?.id === item.id) setDraft(null);
    setPendingDelete(null);
    setNotice(tx(lang, { en: "Deleted. Chinese and English were removed together.", zh: "已刪除。中文與英文已一併移除。" }));
  }

  return (
    <section className="site-wrap py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TextLink href={withLang(lang, "/news")}>
          {tx(lang, { en: "View the public announcements", zh: "查看公開公告" })}
        </TextLink>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85"
        >
          {tx(lang, { en: "New announcement", zh: "新增公告" })}
        </button>
      </div>
      {notice ? <p className="mt-4 text-sm text-[#1d4f86]">{notice}</p> : null}

      {draft ? (
        <div className="mt-8">
          <AnnouncementEditor
            key={draft.id}
            lang={lang}
            draft={draft}
            setDraft={(next) => {
              setDraft((current) => {
                if (!current) return current;
                return typeof next === "function" ? next(current) : next;
              });
            }}
            onCancel={() => setDraft(null)}
            onSave={save}
          />
        </div>
      ) : null}

      <h2 className="mt-10 text-3xl text-ink">{tx(lang, { en: "All announcements", zh: "全部公告" })}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border bg-cream p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {tx(lang, { en: "Order", zh: "順序" })} {item.order}
                  {" · "}
                  <time dateTime={item.date}>{formatDate(lang, item.date)}</time>
                  {" · "}
                  {item.status === "published"
                    ? tx(lang, { en: "Published", zh: "已發布" })
                    : tx(lang, { en: "Draft", zh: "草稿" })}
                  {" · "}
                  <span className={isSynchronized(item) ? "text-[#1d4f86]" : "text-burgundy"}>
                    {isSynchronized(item)
                      ? tx(lang, { en: "Synchronized", zh: "已同步" })
                      : tx(lang, { en: "Not synchronized", zh: "尚未同步" })}
                  </span>
                </p>
                <p className="mt-2 text-lg leading-snug text-ink">{item.title.zh || tx(lang, { en: "No Chinese title", zh: "尚未填寫中文標題" })}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.title.en || tx(lang, { en: "No English title", zh: "尚未填寫英文標題" })}
                </p>
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="mt-3 h-16 w-24 rounded-lg object-cover" /> : null}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="text-sm font-semibold text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
                >
                  {tx(lang, { en: "Edit", zh: "編輯" })}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  className="text-sm font-semibold text-burgundy underline decoration-burgundy/30 underline-offset-4 hover:decoration-burgundy"
                >
                  {tx(lang, { en: "Delete", zh: "刪除" })}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121a27]/45 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-announcement-title" className="w-full max-w-md rounded-2xl bg-cream p-6 shadow-xl">
            <h2 id="delete-announcement-title" className="text-2xl text-ink">
              {tx(lang, { en: "Delete this announcement?", zh: "刪除這則公告？" })}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "This removes the Chinese and English versions together. The public site will lose both.",
                zh: "中文與英文版本會一起刪除，公開網站兩邊都不會再顯示。",
              })}
            </p>
            <p className="mt-3 text-sm font-medium text-ink">{pendingDelete.title[lang] || pendingDelete.title.zh || pendingDelete.title.en}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => remove(pendingDelete)}
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
              >
                {tx(lang, { en: "Delete announcement", zh: "刪除公告" })}
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

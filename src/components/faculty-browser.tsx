"use client";

import { Input } from "@/components/ui/input";
import { ExternalLink } from "@/components/site-links";
import { facultyCategories, type FacultyCategory, type FacultyRecord } from "@/lib/faculty-record";
import { tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filter = "all" | FacultyCategory;

const categoryLabel: Record<FacultyCategory, { en: string; zh: string }> = {
  "full-time": { en: "Full-time", zh: "專任" },
  visiting: { en: "Visiting", zh: "客座" },
  adjunct: { en: "Adjunct", zh: "兼任" },
};

const fallbackPhoto = "/faculty-placeholder.svg";

const addButton =
  "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85";
const editButton =
  "inline-flex h-10 items-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-ink hover:border-burgundy";

export function FacultyBrowser({ lang, people, canManage = false }: { lang: Lang; people: FacultyRecord[]; canManage?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return people.filter((person) => {
      if (filter !== "all" && person.category !== filter) return false;
      if (!needle) return true;
      const blob = `${person.name} ${person.title ?? ""} ${person.research_fields ?? ""} ${person.education ?? ""}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [filter, people, query]);

  const filters: { id: Filter; label: { en: string; zh: string } }[] = [
    { id: "all", label: { en: "All", zh: "全部" } },
    ...facultyCategories.map((id) => ({ id, label: categoryLabel[id] })),
  ];

  return (
    <div>
      {canManage ? (
        <div className="mb-6 flex justify-end">
          <Link href={withLang(lang, "/admin/faculty?new=1")} className={addButton}>
            {tx(lang, { en: "Add faculty", zh: "新增師資" })}
          </Link>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-11 rounded-full px-4 text-sm font-medium ${
                filter === item.id ? "bg-ink text-cream" : "bg-muted text-foreground"
              }`}
            >
              {tx(lang, item.label)}
            </button>
          ))}
        </div>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tx(lang, { en: "Search name or field", zh: "搜尋姓名或專長" })}
          className="h-11 text-base sm:max-w-xs"
          aria-label={tx(lang, { en: "Search faculty", zh: "搜尋師資" })}
        />
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {people.length === 0
            ? tx(lang, { en: "No faculty are listed yet.", zh: "目前沒有師資資料。" })
            : tx(lang, {
                en: "No faculty match that search. Try a field such as marketing, finance, or AI.",
                zh: "沒有符合的教師。可以試試行銷、財務或人工智慧。",
              })}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {sections(visible).map((section) => (
            <section key={section.id}>
              <h2 className="text-2xl text-ink">{tx(lang, section.label)}</h2>
              <ul className="mt-4 grid grid-cols-1 gap-4">
                {section.people.map((person) => (
                  <li key={person.id} id={person.id}>
                    <FacultyCard person={person} lang={lang} canManage={canManage} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function sections(people: FacultyRecord[]) {
  const grouped: { id: string; label: { en: string; zh: string }; people: FacultyRecord[] }[] = facultyCategories.map((id) => ({
    id,
    label: categoryLabel[id],
    people: people.filter((person) => person.category === id),
  }));
  const other = people.filter((person) => person.category === null);
  if (other.length > 0) grouped.push({ id: "other", label: { en: "Other", zh: "其他" }, people: other });
  return grouped.filter((section) => section.people.length > 0);
}

function FacultyCard({ person, lang, canManage }: { person: FacultyRecord; lang: Lang; canManage: boolean }) {
  return (
    <article className="interactive-card flex w-full flex-col gap-5 rounded-2xl border-border bg-cream p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <img
        src={person.image_url || fallbackPhoto}
        alt=""
        className="h-56 w-44 shrink-0 rounded-2xl object-cover object-top sm:h-64 sm:w-48"
      />
      <div className="min-w-0 flex-1">
        {canManage ? (
          <Link href={withLang(lang, `/admin/faculty?edit=${person.id}`)} className={editButton}>
            {tx(lang, { en: "Edit", zh: "編輯" })}
          </Link>
        ) : null}
        <h3 className={`${canManage ? "mt-3" : ""} font-sans text-2xl font-semibold tracking-normal text-ink sm:text-3xl`}>{person.name}</h3>
        {person.title ? <p className="mt-2 text-lg text-burgundy">{person.title}</p> : null}
        {person.category ? <p className="mt-1 text-lg text-[#243044]">{tx(lang, categoryLabel[person.category])}</p> : null}
        {person.research_fields ? <p className="mt-4 text-lg leading-relaxed text-foreground">{person.research_fields}</p> : null}
        {person.education ? <p className="mt-3 text-lg leading-relaxed text-[#243044]">{person.education}</p> : null}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-lg text-[#243044]">
          {person.phone ? <span>{person.phone}</span> : null}
          {person.email ? (
            <a className="underline underline-offset-2" href={`mailto:${person.email}`}>
              {person.email}
            </a>
          ) : null}
          {person.website ? (
            <ExternalLink href={person.website} className="text-lg">
              {tx(lang, { en: "Personal website", zh: "個人網站" })}
            </ExternalLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}

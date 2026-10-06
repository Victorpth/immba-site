"use client";

import { faculty, type FacultyMember } from "@/content/faculty";
import { Input } from "@/components/ui/input";
import { tx, type Lang } from "@/lib/i18n";
import { useMemo, useState } from "react";

type Filter = "all" | "full" | "part";

function initials(name: string) {
  const parts = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((part) => part.length > 1);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export function FacultyBrowser({ lang }: { lang: Lang }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const people = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return faculty.filter((person) => {
      if (filter !== "all" && person.type !== filter) return false;
      if (!needle) return true;
      const blob = `${person.name} ${person.rank.en} ${person.rank.zh} ${person.specialties.en} ${person.specialties.zh} ${person.education.en}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [filter, query]);

  const filters: { id: Filter; label: { en: string; zh: string } }[] = [
    { id: "all", label: { en: "All", zh: "全部" } },
    { id: "full", label: { en: "Full-time", zh: "專任" } },
    { id: "part", label: { en: "Part-time", zh: "兼任" } },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
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
          className="h-10 sm:max-w-xs"
          aria-label={tx(lang, { en: "Search faculty", zh: "搜尋師資" })}
        />
      </div>
      {people.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          {tx(lang, {
            en: "No faculty match that search. Try a field such as marketing, finance, or AI.",
            zh: "沒有符合的教師。可以試試行銷、財務或人工智慧。",
          })}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {people.map((person) => (
            <li key={person.id} id={person.id}>
              <FacultyCard person={person} lang={lang} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FacultyCard({ person, lang }: { person: FacultyMember; lang: Lang }) {
  return (
    <article className="flex h-full gap-4 rounded-2xl border border-border bg-cream p-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink font-display text-lg text-cream">
        {initials(person.name)}
      </div>
      <div className="min-w-0">
        <h2 className="font-sans text-lg font-semibold tracking-normal text-ink">{person.name}</h2>
        <p className="mt-1 text-sm text-burgundy">{tx(lang, person.rank)}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{tx(lang, person.specialties)}</p>
        <p className="mt-2 text-sm text-muted-foreground">{tx(lang, person.education)}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {person.office ? <span>{person.office}</span> : null}
          {person.phone ? <span>{person.phone}</span> : null}
          {person.email ? (
            <a className="underline underline-offset-2" href={`mailto:${person.email}`}>
              {person.email}
            </a>
          ) : null}
          {person.website ? (
            <a className="underline underline-offset-2" href={person.website}>
              {tx(lang, { en: "Website", zh: "個人網站" })}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

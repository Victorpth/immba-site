"use client";

import { fileKind } from "@/components/site-links";
import { publishedAnnouncements } from "@/content/announcements";
import { useAnnouncements } from "@/lib/announcement-store";
import { tx, withLang, type Lang } from "@/lib/i18n";
import { searchSite } from "@/lib/search";
import { ArrowUpRight } from "lucide-react";

export function SearchHits({ lang, query }: { lang: Lang; query: string }) {
  const hits = query ? searchSite(lang, query, publishedAnnouncements(useAnnouncements())) : [];

  if (query.length > 0 && query.length < 2) {
    return (
      <p className="mt-8 text-sm text-muted-foreground">
        {tx(lang, { en: "Type at least two characters.", zh: "請至少輸入兩個字。" })}
      </p>
    );
  }

  if (query.length >= 2 && hits.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-border px-6 py-12 text-sm text-muted-foreground">
        {tx(lang, {
          en: "Nothing matched. Try admissions, KEDGE, thesis, or a course name.",
          zh: "沒有相符的結果。可以試試招生、KEDGE、論文或課程名稱。",
        })}
      </p>
    );
  }

  if (hits.length === 0) return null;

  return (
    <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-cream">
      {hits.map((hit) => {
        const external = hit.href.startsWith("http");
        const href = external ? hit.href : withLang(lang, hit.href);
        return (
          <li key={`${hit.kind}-${hit.href}-${hit.title}`}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="block px-5 py-4 hover:bg-muted/60"
            >
              <span className="text-[11px] font-semibold tracking-[0.14em] text-burgundy uppercase">{hit.kind}</span>
              <span className="mt-1 flex items-center gap-1 font-medium text-ink">
                {fileKind(hit.href) && !hit.title.includes(`(${fileKind(hit.href)})`)
                  ? `${hit.title} (${fileKind(hit.href)})`
                  : hit.title}
                {external ? <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{hit.excerpt}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

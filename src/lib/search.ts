import { documents } from "@/content/documents";
import { faculty } from "@/content/faculty";
import { searchablePages } from "@/content/nav";
import { news } from "@/content/news";
import type { Lang } from "@/lib/i18n";

export type SearchHit = {
  href: string;
  title: string;
  kind: string;
  excerpt: string;
};

function hit(query: string, haystack: string) {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

export function searchSite(lang: Lang, raw: string): SearchHit[] {
  const query = raw.trim();
  if (query.length < 2) return [];
  const kind = {
    page: lang === "zh" ? "頁面" : "Page",
    news: lang === "zh" ? "公告" : "News",
    faculty: lang === "zh" ? "師資" : "Faculty",
    file: lang === "zh" ? "文件" : "Document",
  };

  const pages: SearchHit[] = searchablePages
    .filter((page) => hit(query, `${page.label.en} ${page.label.zh} ${page.description.en} ${page.description.zh}`))
    .map((page) => ({
      href: page.href,
      title: page.label[lang],
      kind: kind.page,
      excerpt: page.description[lang],
    }));

  const stories: SearchHit[] = news
    .filter((item) =>
      hit(
        query,
        `${item.title.en} ${item.title.zh} ${item.summary.en} ${item.summary.zh} ${item.body.en.join(" ")} ${item.body.zh.join(" ")}`,
      ),
    )
    .map((item) => ({
      href: `/news/${item.slug}`,
      title: item.title[lang],
      kind: kind.news,
      excerpt: item.summary[lang],
    }));

  const people: SearchHit[] = faculty
    .filter((person) =>
      hit(
        query,
        `${person.name} ${person.rank.en} ${person.rank.zh} ${person.specialties.en} ${person.specialties.zh} ${person.education.en}`,
      ),
    )
    .map((person) => ({
      href: `/faculty#${person.id}`,
      title: person.name,
      kind: kind.faculty,
      excerpt: person.specialties[lang],
    }));

  const files: SearchHit[] = documents
    .filter(
      (doc) =>
        (doc.audience === "both" || doc.audience === lang) &&
        hit(query, `${doc.title.en} ${doc.title.zh} ${doc.note.en} ${doc.note.zh}`),
    )
    .map((doc) => ({
      href: doc.href,
      title: doc.title[lang],
      kind: kind.file,
      excerpt: doc.note[lang],
    }));

  return [...pages, ...stories, ...people, ...files].slice(0, 24);
}

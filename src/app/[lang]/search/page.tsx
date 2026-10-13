import { SearchHits } from "@/components/search-hits";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "Search", zh: "搜尋" };
const description = {
  en: "Search imMBA pages, news, faculty, and documents.",
  zh: "搜尋國際經管的頁面、公告、師資與文件。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return pageMeta(params, title, description);
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const { q = "" } = await searchParams;
  const query = q.trim();

  return (
    <section className="site-wrap py-14">
      <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
        {tx(lang, { en: "Search", zh: "搜尋" })}
      </p>
      <h1 className="mt-3 text-4xl text-ink">
        {query
          ? tx(lang, { en: `Results for “${query}”`, zh: `「${query}」的結果` })
          : tx(lang, { en: "Search the program", zh: "搜尋本班資訊" })}
      </h1>
      <form className="mt-6" action={withLang(lang, "/search")}>
        <input
          name="q"
          defaultValue={query}
          placeholder={tx(lang, { en: "Try dual degree, tuition, or a professor’s name", zh: "試試雙碩士、學雜費，或教師姓名" })}
          className="h-12 w-full max-w-xl rounded-xl border border-input bg-cream px-4 text-base outline-none focus:border-ring"
        />
      </form>
      <SearchHits lang={lang} query={query} />
      {!query ? (
        <div className="mt-10 flex flex-wrap gap-2 text-sm">
          {[
            { href: "/admissions", en: "Admissions", zh: "招生" },
            { href: "/dual-degree", en: "Dual degree", zh: "雙碩士" },
            { href: "/faculty", en: "Faculty", zh: "師資" },
            { href: "/downloads", en: "Downloads", zh: "下載" },
          ].map((item) => (
            <Link
              key={item.href}
              href={withLang(lang, item.href)}
              className="text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]"
            >
              {lang === "zh" ? item.zh : item.en}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

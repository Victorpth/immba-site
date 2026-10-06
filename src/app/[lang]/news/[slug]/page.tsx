import { categoryLabel, getNews, news } from "@/content/news";
import { formatDate, isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ["en", "zh"].flatMap((lang) => news.map((item) => ({ lang, slug: item.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = getNews(slug);
  if (!item || !isLang(lang)) return { title: "News" };
  return pageMeta(Promise.resolve({ lang }), item.title, item.summary);
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const item = getNews(slug);
  if (!item) notFound();
  const lang = raw;
  const related = news.filter((story) => story.slug !== item.slug && story.category === item.category).slice(0, 3);

  return (
    <article>
      <header className="border-b border-border bg-cream">
        <div className="site-wrap py-14 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
            {tx(lang, categoryLabel[item.category])} · {formatDate(lang, item.date)}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-ink sm:text-5xl">{tx(lang, item.title)}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{tx(lang, item.summary)}</p>
        </div>
      </header>
      <div className="site-wrap grid gap-12 py-12 lg:grid-cols-[1fr_16rem]">
        <div className="max-w-2xl space-y-5 text-base leading-8">
          {item.body[lang].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {item.links && item.links.length > 0 ? (
            <ul className="space-y-2 pt-2">
              {item.links.map((link) => {
                const external = link.href.startsWith("http");
                const href = external ? link.href : withLang(lang, link.href);
                return (
                  <li key={link.href}>
                    <a href={href} className="text-burgundy underline underline-offset-4">
                      {tx(lang, link.label)}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        <aside>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {tx(lang, { en: "Related", zh: "相關" })}
          </p>
          <ul className="mt-3 space-y-3">
            {related.map((story) => (
              <li key={story.slug}>
                <Link href={withLang(lang, `/news/${story.slug}`)} className="text-sm leading-relaxed hover:text-burgundy">
                  {tx(lang, story.title)}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={withLang(lang, "/news")} className="mt-6 inline-flex text-sm underline underline-offset-4">
            {tx(lang, { en: "All news", zh: "全部公告" })}
          </Link>
        </aside>
      </div>
    </article>
  );
}

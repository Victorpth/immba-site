import { NewsCard } from "@/components/news-card";
import { PageIntro } from "@/components/page-intro";
import { news } from "@/content/news";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "News", zh: "公告" };
const description = {
  en: "Announcements from the MBA in International Management.",
  zh: "國際經營管理碩士班最新公告。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const pinned = news.filter((item) => item.pinned);
  const rest = news.filter((item) => !item.pinned).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "News", zh: "公告" }}
        title={{ en: "Pinned first, then the newest.", zh: "置頂在前，其餘按日期。" }}
        lede={{
          en: "Application windows, course news, and notes from the office.",
          zh: "招生窗口、課程消息，以及所辦記事。",
        }}
      />
      <section className="site-wrap py-14">
        <div className="grid gap-4">
          {pinned.map((item) => (
            <NewsCard key={item.slug} item={item} lang={lang} featured />
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((item) => (
            <NewsCard key={item.slug} item={item} lang={lang} />
          ))}
        </div>
      </section>
    </>
  );
}

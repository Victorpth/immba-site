import { NewsCard } from "@/components/news-card";
import { PageIntro } from "@/components/page-intro";
import { ExternalLink } from "@/components/site-links";
import { news } from "@/content/news";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Highlights", zh: "活動集錦" };
const description = {
  en: "Information sessions, new courses, and partnership stories from imMBA.",
  zh: "招生說明會、新課程與國際合作的紀錄。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function HighlightsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const stories = news.filter((item) => item.category !== "careers");

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Stories", zh: "集錦" }}
        title={{ en: "What the semester has looked like.", zh: "這個學期，學程在做這些事。" }}
        lede={{
          en: "The current official highlights are the Bond University visit, the UT Dallas scholarship, and the 29 September admissions session. Earlier notes stay on this page.",
          zh: "官方活動集錦目前是邦德大學來訪、德州大學達拉斯分校獎學金，以及 9 月 29 日招生說明會。較早的紀錄仍留在本頁。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 md:grid-cols-2">
        {stories.map((item) => (
          <NewsCard key={item.slug} item={item} lang={lang} />
        ))}
      </section>
      <section className="border-t border-border">
        <div className="site-wrap py-10">
          <ExternalLink
            href="https://www.management.fju.edu.tw/esubweb/immbaengindex/subedit.php?EID=36"
            className="text-sm text-ink"
          >
            {tx(lang, { en: "Official highlights page", zh: "官方活動集錦" })}
          </ExternalLink>
        </div>
      </section>
    </>
  );
}

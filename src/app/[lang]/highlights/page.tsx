import { NewsCard } from "@/components/news-card";
import { PageIntro } from "@/components/page-intro";
import { news } from "@/content/news";
import { isLang } from "@/lib/i18n";
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
          en: "Sessions, course spotlights, and visits from partner schools. Each card opens the full note.",
          zh: "說明會、課程焦點，以及合作學校的來訪。點進卡片可讀完整內容。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 md:grid-cols-2">
        {stories.map((item) => (
          <NewsCard key={item.slug} item={item} lang={lang} />
        ))}
      </section>
    </>
  );
}

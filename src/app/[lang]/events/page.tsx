import { NewsCard } from "@/components/news-card";
import { PageIntro } from "@/components/page-intro";
import { news } from "@/content/news";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Events", zh: "活動" };
const description = {
  en: "Information sessions, partner visits, and gatherings around the imMBA program.",
  zh: "國際經管的招生說明會、夥伴來訪與活動。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function EventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const events = news.filter((item) => item.category === "campus" || item.category === "partnerships");

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Events", zh: "活動" }}
        title={{ en: "Sessions, visits, and the room they happen in.", zh: "說明會、來訪，以及這些活動發生的地方。" }}
        lede={{
          en: "Partner schools, information sessions, and campus notes. Announcements about deadlines stay on the news page.",
          zh: "合作學校、招生說明會與校園紀錄。報名期限等公告請見公告頁。",
        }}
      />
      <section className="site-wrap py-14">
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            {tx(lang, {
              en: "No events are posted yet. Check announcements for the next session.",
              zh: "目前沒有活動貼文。下一場說明會請看公告。",
            })}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((item) => (
              <NewsCard key={item.slug} item={item} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

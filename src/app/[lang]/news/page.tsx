import { PageIntro } from "@/components/page-intro";
import { PublicAnnouncements } from "@/components/public-announcements";
import { AnnouncementSource } from "@/components/site-links";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Announcements", zh: "公告" };
const description = {
  en: "Announcements from the MBA in International Management, shown in the language selected on the site.",
  zh: "國際經營管理碩士班公告，依網站目前選擇的語言顯示標題與內容。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Announcements", zh: "公告" }}
        title={{ en: "Title and content, in the language you selected.", zh: "標題與內容，依你選擇的語言顯示。" }}
        lede={{
          en: "Published announcements from AdminNews. View Details opens the notice link.",
          zh: "來自公告管理的已發布公告。查看詳情會開啟該則連結。",
        }}
      />
      <section className="site-wrap py-14">
        <PublicAnnouncements lang={lang} />
        <div className="mt-8">
          <AnnouncementSource lang={lang} />
        </div>
      </section>
    </>
  );
}

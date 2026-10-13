import { AdminNewsManager } from "@/components/admin-news";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "AdminNews", zh: "公告管理" };
const description = {
  en: "Create, preview, update, and delete bilingual imMBA announcements.",
  zh: "新增、預覽、更新與刪除國際經管的雙語公告。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdminNewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "AdminNews", zh: "公告管理" }}
        title={{ en: "Manage announcements in both languages.", zh: "用同一筆記錄管理中英文公告。" }}
        lede={{
          en: "Each announcement keeps one date, link, order, and status, plus a Chinese and an English title and content. The public site reads these same records and shows the language the visitor selected.",
          zh: "每一則公告共用日期、連結、順序與狀態，並各有中文與英文的標題和內容。公開網站讀取同一批資料，依訪客選擇的語言顯示。",
        }}
      />
      <AdminNewsManager lang={lang} />
    </>
  );
}

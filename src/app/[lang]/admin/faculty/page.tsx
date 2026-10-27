import { AdminFaculty } from "@/components/admin-faculty";
import { PageIntro } from "@/components/page-intro";
import { isFacultyId } from "@/lib/faculty-record";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "AdminFaculty", zh: "師資管理" };
const description = {
  en: "Create, update, reorder, and delete imMBA faculty records.",
  zh: "新增、更新、排序與刪除國際經管的師資資料。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdminFacultyPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ new?: string; edit?: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  const query = await searchParams;
  const start = query.new === "1" ? { mode: "new" as const } : query.edit && isFacultyId(query.edit) ? { mode: "edit" as const, id: query.edit } : undefined;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "AdminFaculty", zh: "師資管理" }}
        title={{ en: "Manage the faculty directory.", zh: "管理師資名錄。" }}
        lede={{
          en: "Records are stored in the faculty table. The public faculty page reads the same rows, in display order.",
          zh: "資料存在師資資料表。公開師資頁讀取同一批資料，並依顯示順序排列。",
        }}
      />
      <AdminFaculty lang={lang} start={start} />
    </>
  );
}

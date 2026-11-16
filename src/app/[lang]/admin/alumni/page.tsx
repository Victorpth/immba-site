import { AdminAlumni } from "@/components/admin-alumni";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "AdminAlumni", zh: "校友管理" };
const description = {
  en: "Create, update, and delete imMBA alumni records.",
  zh: "新增、更新與刪除國際經管的校友資料。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdminAlumniPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();

  return (
    <>
      <PageIntro
        lang={raw}
        eyebrow={{ en: "AdminAlumni", zh: "校友管理" }}
        title={{ en: "Manage alumni.", zh: "管理校友。" }}
        lede={{
          en: "Records are stored in the alumni table. Only an admin or a super admin can open this page.",
          zh: "資料存在校友資料表。只有管理員或超級管理員可以開啟這個頁面。",
        }}
      />
      <AdminAlumni lang={raw} />
    </>
  );
}

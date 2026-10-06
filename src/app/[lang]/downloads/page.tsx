import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { docGroups } from "@/content/documents";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Downloads", zh: "表格下載" };
const description = {
  en: "Brochures, cohort rules, thesis forms, and dual-degree contracts published by imMBA.",
  zh: "國際經管公布的簡章、修業規則、論文表格與雙碩士合約。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function DownloadsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Documents", zh: "文件" }}
        title={{ en: "The files the office actually uses.", zh: "所辦真正在用的檔案。" }}
        lede={{
          en: "Brochures, rules, and forms, grouped the way a student looks for them. Files open from the university’s own document library.",
          zh: "簡章、辦法與表格，按學生會找的方式分類。檔案開啟自學校既有的文件庫。",
        }}
      />
      <section className="site-wrap space-y-10 py-14">
        {docGroups.map((group) => (
          <div key={group.id} id={group.id}>
            <h2 className="mb-4 text-2xl text-ink">{tx(lang, group.label)}</h2>
            <DocList lang={lang} group={group.id} />
          </div>
        ))}
      </section>
    </>
  );
}

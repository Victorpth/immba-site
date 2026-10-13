import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Graduation", zh: "畢業與離校" };
const description = {
  en: "Thesis defense deadlines, required forms, and the steps for leaving Fu Jen with the MBA.",
  zh: "論文口試期限、應備表格，以及取得 MBA 的離校步驟。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function GraduationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Graduation", zh: "畢業" }}
        title={{ en: "The defense has a date. The paperwork starts earlier.", zh: "口試有截止日，文件要更早開始。" }}
        lede={{
          en: "Read the graduation rules for the term you entered. The office releases the thesis-advisor list in late March and in September. In the semester you plan to defend, enroll in Thesis before add-and-drop ends.",
          zh: "請閱讀自己入學學期的修業規則。所辦約在三月下旬與九月公布論文指導老師名單。擬口試的那個學期，須在加退選結束前加選「論文」。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 lg:grid-cols-3">
        {[
          {
            step: "01",
            title: { en: "Read your entry-year file", zh: "先讀自己那一屆" },
            body: {
              en: "The office publishes a separate file for students who entered in fall 2025, 2024, 2023, 2021, 2018, 2017, or 2014.",
              zh: "所辦分別公布 2025、2024、2023、2021、2018、2017 與 2014 年秋季入學適用的修業規則。",
            },
          },
          {
            step: "02",
            title: { en: "Enroll in Thesis", zh: "先加選論文" },
            body: {
              en: "Add the Thesis course before add-and-drop ends in the semester you plan to defend.",
              zh: "擬口試的那個學期，加退選結束前必須加選「論文」。",
            },
          },
          {
            step: "03",
            title: { en: "Use the office forms", zh: "使用所辦表格" },
            body: {
              en: "The process file, the library thesis guide, the thesis format, the defense agreement, and the acceptance form are listed below.",
              zh: "口試與畢業流程、圖書館論文資源、論文格式、口試同意書與修改完成證明都列在下方。",
            },
          },
        ].map((item) => (
          <article key={item.step} className="rounded-2xl bg-ink p-6 text-cream">
            <p className="text-xs tracking-[0.18em] text-gold">{item.step}</p>
            <h2 className="mt-3 text-2xl text-cream">{tx(lang, item.title)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">{tx(lang, item.body)}</p>
          </article>
        ))}
      </section>
      <section className="site-wrap pb-16">
        <h2 className="mb-5 text-3xl text-ink">{tx(lang, { en: "Forms", zh: "表格" })}</h2>
        <DocList lang={lang} group="graduation" />
      </section>
    </>
  );
}

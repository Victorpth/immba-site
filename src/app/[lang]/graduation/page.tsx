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
          en: "You may apply for the defense in any semester once you meet the rules for your cohort. Fall defenses close on 31 January. Spring defenses close on 31 July. The university calendar can move the exact day.",
          zh: "符合該屆修業規則後，每個學期都可以申請口試。秋季口試截止日為 1 月 31 日，春季為 7 月 31 日。實際日期配合當年度輔大行事曆。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 lg:grid-cols-3">
        {[
          {
            step: "01",
            title: { en: "Meet your cohort rules", zh: "先符合修業規則" },
            body: {
              en: "Core courses, electives, the thesis, and the English threshold are all specified. The 42-credit minimum includes 6 thesis credits.",
              zh: "專業必修、選修、論文與英文門檻都有規定。最低 42 學分，含論文 6 學分。",
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
            title: { en: "Follow the process file", zh: "依流程提前辦理" },
            body: {
              en: "Work before and after the defense needs time. Use the steps published by the office, then the library deposit.",
              zh: "口試前後都有作業時間。請依所辦公布的流程，並完成圖書館論文程序。",
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

import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Curriculum", zh: "課程與修業規則" };
const description = {
  en: "A 42-credit English MBA, prerequisite courses, waivers, and the current timetable.",
  zh: "42 學分的全英語 MBA、基礎課程、抵免與最新課表。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const areas = [
  { en: "International business", zh: "國際企業管理" },
  { en: "Marketing", zh: "行銷" },
  { en: "Human resources", zh: "人力資源" },
  { en: "Global supply chain", zh: "全球供應鏈" },
  { en: "Financial management", zh: "財務管理" },
  { en: "Service design", zh: "服務設計" },
  { en: "Data analytics", zh: "數據分析" },
  { en: "AI and digital products", zh: "AI 與數位產品" },
];

export default async function CurriculumPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Academics", zh: "課程" }}
        title={{ en: "Forty-two credits. The thesis is six of them.", zh: "最低 42 學分，其中論文 6 學分。" }}
        lede={{
          en: "Most students plan three or four semesters. Rules for core courses, electives, the thesis, and the English requirement depend on the term you entered. Read the file for your cohort.",
          zh: "一般規劃三到四個學期。專業必修、選修、論文與英文門檻依入學學期而不同，請閱讀自己那一屆的修業規則。",
        }}
      />
      <section className="site-wrap py-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => (
            <div key={area.en} className="rounded-2xl border border-border bg-cream px-4 py-5">
              <p className="font-display text-2xl text-ink">{tx(lang, area)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-cream p-6">
            <h2 className="text-2xl text-ink">{tx(lang, { en: "If your bachelor’s was not in business", zh: "大學不是商管本科" })}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "Economics, business management, statistics, and accounting are prerequisites. Before the first semester, submit a transcript showing that one of them was passed as an undergraduate. If you cannot, take and pass one undergraduate course at Fu Jen in the first semester. Check the title and credits with the office first. Prerequisite courses do not count toward the 42.",
                zh: "經濟學、管理學（企業管理）、統計學與會計學是基礎課程。第一學期開學前，請繳交學士班曾修讀其中一科且及格的成績證明。未能提出者，須在第一學期於輔大學士班補修一科。開課名稱與學分請先與所辦確認。基礎課程不計入畢業學分。",
              })}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-6">
            <h2 className="text-2xl text-ink">{tx(lang, { en: "Course waiver", zh: "碩士學分抵免" })}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "If you have already completed professional imMBA courses, you may request a waiver once, before you officially enroll, and no later than the first week of class. The chair decides. Bring the transcript and the university waiver forms.",
                zh: "曾在本班修過專業課程且符合資格者，可於入學當學期向註冊組申請抵免，以一次為限，開學後一週截止。是否抵免由主任決定。請備成績單與學校抵免表格。",
              })}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-6 lg:col-span-2">
            <h2 className="text-2xl text-ink">{tx(lang, { en: "Advisor and the thesis course", zh: "指導老師與「論文」這門課" })}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "The office releases the list of professors in late March and early October. You do not need an advisor on the day you are admitted. In the semester you intend to defend, enroll in Thesis before the add-and-drop deadline, or you cannot apply for the defense that term.",
                zh: "所辦約在三月底與十月初公布可指導的教師名單，錄取當下不必立刻找老師。擬口試的那個學期，必須在加退選結束前加選「論文」，否則該學期不能提出口試。",
              })}
            </p>
          </article>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl text-ink">{tx(lang, { en: "Timetable, catalog, and cohort rules", zh: "課表、目錄與修業規則" })}</h2>
          <div className="mt-5">
            <DocList lang={lang} group="curriculum" />
          </div>
          <div className="mt-4">
            <DocList lang={lang} group="graduation" />
          </div>
        </div>
      </section>
    </>
  );
}

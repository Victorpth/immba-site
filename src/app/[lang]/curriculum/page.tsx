import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { ExternalLink, TextLink } from "@/components/site-links";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Curriculum", zh: "課程與修業規則" };
const description = {
  en: "A 42-credit English MBA, prerequisite courses, waivers, curriculum maps, and the current timetable.",
  zh: "42 學分的全英語 MBA、基礎課程、抵免、修課結構與最新課表。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const areas = [
  { en: "Marketing", zh: "行銷" },
  { en: "Operations", zh: "營運" },
  { en: "Finance", zh: "財務" },
  { en: "Human resources", zh: "人力資源" },
  { en: "Technology", zh: "科技" },
  { en: "Strategy", zh: "策略" },
];

export default async function CurriculumPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Courses", zh: "課程" }}
        title={{ en: "Forty-two credits. The thesis is six of them.", zh: "最低 42 學分，其中論文 6 學分。" }}
        lede={{
          en: "imMBA is an AACSB-accredited, English-taught master’s. Most students plan three or four semesters. Rules for core courses, electives, the thesis, and the English requirement depend on the term you entered.",
          zh: "國際經管是 AACSB 認證的全英語碩士班。一般規劃三到四個學期。專業必修、選修、論文與英文門檻依入學學期而不同，請閱讀自己那一屆的修業規則。",
        }}
      />
      <section className="site-wrap py-14">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {tx(lang, {
            en: "The official curriculum covers marketing, operations, finance, human resources, technology, and strategy. Graduation rules, the timetable, and the course catalog are published as files below.",
            zh: "官方課程涵蓋行銷、營運、財務、人力資源、科技與策略。修業規則、課表與課程目錄以下方檔案為準。",
          })}{" "}
          <TextLink href={withLang(lang, "/about")}>
            {tx(lang, { en: "Overview and ranking", zh: "更多特色與排名" })}
          </TextLink>
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                en: "Economics, business management, statistics, and accounting are prerequisites. Before the first semester, submit a transcript showing that one of them was passed as an undergraduate, with the grade and the credits. If you cannot, take and pass one undergraduate course at Fu Jen in the first semester, or the second semester’s master’s registration can be affected. Check the title and credits with the office first. Prerequisite courses do not count toward the 42.",
                zh: "經濟學、管理學（企業管理）、統計學與會計學是基礎課程。第一學期開學前，請主動繳交學士班曾修讀其中一科且及格的成績與學分證明。未能提出者，視為未曾修讀或未達 60 分，須在第一學期於輔大學士班補修一科，以免影響第二學期選課。開課名稱與學分請先與所辦確認。補修通過的基礎課程不計入畢業學分。",
              })}
            </p>
            <p className="mt-4">
              <ExternalLink href="http://estu.fju.edu.tw/fjucourse/ava_form_eng.asp" className="text-sm">
                {tx(lang, { en: "Fu Jen undergraduate course list", zh: "輔大學士班開課查詢" })}
              </ExternalLink>
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-6">
            <h2 className="text-2xl text-ink">{tx(lang, { en: "Course waiver", zh: "碩士學分抵免" })}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "If you have already completed professional imMBA courses and you qualify, you may request a waiver once, in the semester you enroll, and no later than the first week of class. Late requests are not accepted. Bring the original transcript, the waiver application, and the credit certificate. The chair decides.",
                zh: "曾在本班修過專業課程且符合資格者，可於入學當學期向註冊組申請抵免，以一次為限，開學後一週截止，逾期不受理。請備成績單正本、抵認科目申請表與學生修習科目學分證明。是否抵免由主任決定。",
              })}
            </p>
            <p className="mt-4 flex flex-col items-start gap-2">
              <ExternalLink href="https://academic.fju.edu.tw/teachingServices.jsp?labelID=24" className="text-sm">
                {tx(lang, { en: "Course waiver regulations", zh: "學生抵免科目規則" })}
              </ExternalLink>
              <ExternalLink href="https://academic.fju.edu.tw/resource.jsp?labelID=28" className="text-sm">
                {tx(lang, { en: "Credit certificate forms", zh: "科目學分證明表" })}
              </ExternalLink>
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-cream p-6 lg:col-span-2">
            <h2 className="text-2xl text-ink">{tx(lang, { en: "Advisor and the thesis course", zh: "指導老師與「論文」這門課" })}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "The office releases the list of professors in late March and early October. You contact a professor and confirm the advising relationship in that window. You do not need an advisor on the day you are admitted. In the semester you intend to defend, enroll in Thesis before the add-and-drop deadline, or you cannot apply for the defense that term.",
                zh: "所辦約在三月底與十月初公布可指導的教師名單。同學在這段期間自行聯繫並確認指導老師即可，錄取當下不必立刻找老師。擬口試的那個學期，必須在加退選結束前加選「論文」，否則該學期不能提出口試。",
              })}
            </p>
            <p className="mt-4">
              <TextLink href={withLang(lang, "/graduation")} className="text-sm">
                {tx(lang, { en: "Graduation and leaving school", zh: "畢業與離校" })}
              </TextLink>
            </p>
          </article>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl text-ink">{tx(lang, { en: "Timetable, catalog, and curriculum maps", zh: "課表、目錄與修課結構" })}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "The office publishes the current timetable and the course catalog. Curriculum maps for academic years 112 through 115 show how required courses, electives, and the thesis fit together.",
              zh: "所辦公布最新上課時間表與課程目錄。112 至 115 學年度的修課結構表，說明必修、選修與論文如何搭配。",
            })}
          </p>
          <div className="mt-5">
            <DocList lang={lang} group="curriculum" />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-3xl text-ink">{tx(lang, { en: "Graduation rules by entry term", zh: "依入學學期適用的修業規則" })}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "Prerequisites, required courses, electives, the thesis, and the English graduation threshold are all in the rules for your cohort. Read the file that matches the term you entered.",
              zh: "基礎課程（限大學非商管同學）、專業必修、專業選修、論文與英文畢業門檻都寫在該屆修業規則裡。請閱讀與自己入學學期相符的版本。",
            })}
          </p>
          <div className="mt-5">
            <DocList lang={lang} group="graduation" />
          </div>
        </div>
      </section>
    </>
  );
}

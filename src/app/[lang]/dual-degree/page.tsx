import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Dual degree", zh: "跨國雙碩士" };
const description = {
  en: "The 1+1 master’s pathways with UM-Flint, KEDGE, and IQS, and the four-semester schedule.",
  zh: "與 UM-Flint、KEDGE、IQS 的 1+1 雙碩士，以及四個學期的作業。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const phases = [
  {
    when: { en: "Semester 1 · Fall", zh: "第一學期 · Fall" },
    items: {
      en: ["Submit the dual-degree application in the first week.", "Follow the course plan in the contract.", "Confirm a thesis advisor and begin the thesis."],
      zh: ["開學一週內繳交申請書。", "依合約修課。", "確認論文指導老師並開始撰寫。"],
    },
  },
  {
    when: { en: "Semester 2 · Spring", zh: "第二學期 · Spring" },
    items: {
      en: ["Present the first three chapters on the office date, with the English proof the contract requires.", "Finish the thesis and file the defense agreement in final-exam week.", "Apply for the imMBA scholarship if you wish."],
      zh: ["於所辦排定的日期發表論文前三章，並附上合約要求的英檢。", "期末考週完成論文並繳交口試同意書。", "可視需要申請國際經管獎助學金。"],
    },
  },
  {
    when: { en: "Semester 3 · Fall", zh: "第三學期 · Fall" },
    items: {
      en: ["Register and pay full tuition at Fu Jen.", "Register, pay, and take courses at the partner school.", "Send the partner course list back to Fu Jen at the start of term."],
      zh: ["在輔大完成註冊並繳交全額學雜費。", "依合約在合作學校註冊、繳費、選課。", "學期初把對方課表送回輔大登錄。"],
    },
  },
  {
    when: { en: "Semester 4 · Spring", zh: "第四學期 · Spring" },
    items: {
      en: ["Register and pay at Fu Jen again.", "Finish the partner school’s courses.", "Meet imMBA rules, defend at Fu Jen, and complete leaving-school steps."],
      zh: ["再次於輔大註冊繳費。", "完成合作學校的修課。", "符合國際經管規則後，在輔大口試並辦理離校，取得畢業證書。"],
    },
  },
];

const partners = [
  {
    name: "University of Michigan–Flint",
    place: { en: "Flint, about 100 km from Detroit", zh: "Flint，底特律西北約 100 公里" },
    degree: "Master of Business Administration",
    points: {
      en: ["AACSB accredited. Nine concentrations.", "Declare in week one so your Fu Jen courses follow the UM-Flint plan.", "In year one: the agreed courses and thesis, GPA 3.0, and TOEFL iBT. Sub-scores change, so check UM-Flint.", "In-state tuition and scholarships are offered to imMBA students."],
      zh: ["通過 AACSB，MBA 有九個專業領域。", "第一週表明意願，碩一課程才會按 UM-Flint 計畫分流。", "第一年須完成約定課程與論文、GPA 3.0，以及托福 iBT。分數含分項可能調整，請以該校網站為準。", "對國際經管學生提供州內學費與獎學金。"],
    },
    href: "https://www.umflint.edu/about/explore-flint/",
  },
  {
    name: "KEDGE Business School",
    place: { en: "Bordeaux or Marseille", zh: "波爾多或馬賽" },
    degree: "Master in Management · 60 ECTS",
    points: {
      en: ["Triple-accredited: AACSB, AMBA, and EQUIS.", "At least 240 ECTS (120 credits) from the bachelor’s degree.", "The agreed Fu Jen courses, the thesis, and the English level in the contract.", "KEDGE tuition is waived. You pay Fu Jen. A six-month internship or practical period is required after admission."],
      zh: ["三冠認證：AACSB、AMBA、EQUIS。", "大學學歷至少 240 ECTS（120 學分）。", "完成輔大約定課程、論文，以及合約中的英語條件。", "KEDGE 學費全免，僅繳輔大全額學雜費。入學後須有六個月以上實習或實務經驗。"],
    },
    href: "https://student.kedge.edu/",
  },
  {
    name: "IQS School of Management",
    place: { en: "Barcelona, Universitat Ramon Llull", zh: "巴塞隆納，拉孟大學" },
    degree: "MIMDE or MIBM",
    points: {
      en: ["Founded in 1905, AACSB accredited, and a member of the Jesuit business-school network.", "Choose International Marketing in a Digital Environment, or Industrial Business Management.", "Complete the Fu Jen courses and thesis, the GPA in the agreement, and the English requirement.", "Tuition at IQS is discounted. The figure is reviewed each year in the contract."],
      zh: ["創於 1905 年，通過 AACSB，為耶穌會商管學院聯盟成員。", "可選數位環境國際行銷碩士（MIMDE）或工業企業管理碩士（MIBM）。", "完成輔大約定課程與論文、合約中的 GPA 與英語條件。", "IQS 學費依合約優惠，金額每年檢視。"],
    },
    href: "https://www.iqs.edu/en/about-iqs/accreditations-and-rankings",
  },
];

export default async function DualDegreePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Global", zh: "國際" }}
        title={{ en: "Year one in Taiwan. Year two, if you earn it, abroad.", zh: "第一年在台灣。第二年，夠資格就出國。" }}
        lede={{
          en: "Tell the office in the first week. In the second semester you apply to the partner school yourself. Seats are limited. The chair recommends students by year, grades, and English, and the partner school decides.",
          zh: "第一週向所辦表明意願。第二學期自行向合作學校申請。名額有限時，主任依年級、成績與英檢推薦，錄取由對方決定。",
        }}
      />
      <section className="site-wrap py-14">
        <h2 className="text-3xl text-ink">{tx(lang, { en: "Four semesters", zh: "四個學期" })}</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2">
          {phases.map((phase) => (
            <li key={phase.when.en} className="rounded-2xl border border-border bg-cream p-5">
              <h3 className="text-xl text-ink">{tx(lang, phase.when)}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                {phase.items[lang].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          {tx(lang, {
            en: "Missing this schedule means the application is withdrawn. You may start again from semester one. Degrees earned abroad are recognized under the Ministry of Education’s rules for foreign academic records.",
            zh: "未能依上述進度完成，視為放棄資格，可從第一學期重新申請。國外學歷依教育部「大學辦理國外學歷採認辦法」辦理。",
          })}
        </p>
      </section>
      <section className="border-t border-border bg-cream/40">
        <div className="site-wrap grid gap-6 py-14">
          {partners.map((partner) => (
            <article key={partner.name} className="rounded-2xl border border-border bg-cream p-6 lg:p-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">{tx(lang, partner.place)}</p>
              <h2 className="mt-2 text-3xl text-ink">{partner.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{partner.degree}</p>
              <ul className="mt-5 grid gap-2 text-sm leading-relaxed text-foreground md:grid-cols-2">
                {partner.points[lang].map((point) => (
                  <li key={point} className="rounded-xl bg-muted/70 px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
              <a href={partner.href} className="mt-5 inline-flex text-sm underline underline-offset-4">
                {tx(lang, { en: "Partner site", zh: "合作學校網站" })}
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="site-wrap py-14">
        <h2 className="mb-5 text-3xl text-ink">{tx(lang, { en: "Contracts", zh: "合約與申請書" })}</h2>
        <DocList lang={lang} group="dual" />
      </section>
    </>
  );
}

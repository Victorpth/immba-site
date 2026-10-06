import { PageIntro } from "@/components/page-intro";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "imMBA guide", zh: "imMBA 全攻略" };
const description = {
  en: "Who the program is for, how admissions work, and how a first-year student should plan.",
  zh: "適合誰、怎麼考，以及碩一新鮮人如何安排。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const blocks = [
    {
      title: { en: "A fit, more than a major", zh: "看的是方向，不是大學主修" },
      body: {
        en: "The program is for people who want to work in a group or a foreign firm, who are curious about digital change, innovation, or marketing, who want structured management training, or who are shaping a π-shaped profile before further study. An undergraduate major in business is not required.",
        zh: "如果你想培養國際競爭力、進入集團或外商、關心數位轉型、創新或行銷、需要扎實的管理訓練，或想走成 π 型再繼續深造，國際經管都有位置。大學主修不限商管。",
      },
    },
    {
      title: { en: "You do not pick an advisor on day one", zh: "考上不必馬上找指導老師" },
      body: {
        en: "After add-and-drop each semester, the office posts the advisor list. Most theses take three semesters: one to settle the question with the advisor, then two of regular writing. Dual-degree students finish the thesis before they leave for the partner school.",
        zh: "每學期加退選結束後，所辦才公告指導老師資訊。論文通常三個學期：一學期把題目和架構跟老師確認，接著兩個學期撰寫。要出國讀雙碩士的同學，必須在出國前完成論文。",
      },
    },
    {
      title: { en: "The month before class", zh: "開學前一個月" },
      body: {
        en: "Read the curriculum page and the rules for your entry term. About three weeks before the semester, the office emails course-selection details. Non-business graduates should clear one prerequisite before classes, or plan the makeup course with the office.",
        zh: "先讀課程頁與自己入學年的修業規則。開學前約三週，所辦會以電子郵件說明選課。非商管本科請在開學前完成一科基礎課程的抵免，或與所辦排定補修。",
      },
    },
  ];

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Student guide", zh: "全攻略" }}
        title={{ en: "Your future can start here. The calendar is specific.", zh: "未來可以從這裡開始，行事曆則很具體。" }}
        lede={{
          en: "A short orientation for applicants and for students who have just been admitted.",
          zh: "給準備申請的人，也給剛錄取的同學。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14">
        {blocks.map((block, index) => (
          <article key={block.title.en} className="grid gap-4 rounded-2xl border border-border bg-cream p-6 md:grid-cols-[6rem_1fr]">
            <p className="font-display text-3xl text-gold">0{index + 1}</p>
            <div>
              <h2 className="text-2xl text-ink">{tx(lang, block.title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(lang, block.body)}</p>
            </div>
          </article>
        ))}
        <div className="flex flex-wrap gap-3 pt-4">
          <Link href={withLang(lang, "/admissions")} className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm text-primary-foreground">
            {tx(lang, { en: "Admissions", zh: "招生資訊" })}
          </Link>
          <Link href={withLang(lang, "/curriculum")} className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm">
            {tx(lang, { en: "Curriculum", zh: "課程與抵免" })}
          </Link>
        </div>
      </section>
    </>
  );
}

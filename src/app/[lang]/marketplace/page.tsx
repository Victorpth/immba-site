import { PageIntro } from "@/components/page-intro";
import { ActionLink, TextLink } from "@/components/site-links";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Books and materials", zh: "書籍與教材市集" };
const description = {
  en: "How imMBA students get the books and course materials for each term.",
  zh: "國際經管學生每學期如何取得書籍與上課教材。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function MarketplacePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const steps = [
    {
      title: { en: "The instructor names the books", zh: "授課教師公布書單" },
      body: {
        en: "Before the semester, each professor lists the required books and any course pack. The office emails the selection notes about three weeks before classes.",
        zh: "開學前，各科教師列出指定用書與講義。所辦約在上課前三週以電子郵件寄出選課與教材說明。",
      },
    },
    {
      title: { en: "Buy them before the first week", zh: "第一週前備妥" },
      body: {
        en: "Use the campus bookstores in New Taipei, or the seller the instructor names. Editions matter: match the title and year on the list.",
        zh: "可向新北市校園周邊書店購買，或依教師指定的通路。版本要與書單上的書名和年份一致。",
      },
    },
    {
      title: { en: "Ask the office if a title is unclear", zh: "書單不清楚就問所辦" },
      body: {
        en: "Write to imMBA@mail.fju.edu.tw with the course name. The office will point you to the current list. This page does not take orders or store payment details.",
        zh: "請寄信至 imMBA@mail.fju.edu.tw，並註明課程名稱。所辦會協助對應最新書單。本頁不接受訂購，也不保存付款資料。",
      },
    },
  ];

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Marketplace", zh: "教材市集" }}
        title={{ en: "Books and course materials.", zh: "書籍與上課教材。" }}
        lede={{
          en: "imMBA classes run in English. The reading list changes with the instructor and the year, so the office and the syllabus are the source for what to buy.",
          zh: "國際經管課程以英語進行。書單隨教師與學年調整，請以所辦通知與課程大綱為準。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 md:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title.en} className="rounded-2xl border border-border bg-cream p-6">
            <p className="text-xs text-gold">0{index + 1}</p>
            <h2 className="mt-3 text-2xl text-ink">{tx(lang, step.title)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(lang, step.body)}</p>
          </article>
        ))}
      </section>
      <section className="site-wrap pb-16">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <TextLink href={withLang(lang, "/curriculum")}>
            {tx(lang, { en: "Read the curriculum", zh: "閱讀課程與修業" })}
          </TextLink>
          <ActionLink href={withLang(lang, "/contact")}>{tx(lang, { en: "Contact Us", zh: "聯絡我們" })}</ActionLink>
        </div>
      </section>
    </>
  );
}

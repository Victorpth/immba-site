import { PageIntro } from "@/components/page-intro";
import { ExternalLink } from "@/components/site-links";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "Exchange", zh: "海外交換" };
const description = {
  en: "Tuition-free exchange at Fu Jen’s partner universities, for students who are not taking the dual degree.",
  zh: "不讀雙碩士的同學，可申請輔大姊妹校的免學費交換。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function ExchangePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Exchange", zh: "交換" }}
        title={{ en: "A term abroad, without a second tuition bill.", zh: "出國一個學期，不必再付一份學費。" }}
        lede={{
          en: "Students who are not taking the dual degree are encouraged to use Fu Jen’s tuition-free exchange with partner schools. Procedures, requirements, the deadline, and the school list are published by the International Student Center.",
          zh: "不讀雙碩士的同學，學校鼓勵申請輔大姊妹校的免學費交換。流程、條件、截止日與學校名單由國際學生中心公布。",
        }}
      />
      <section className="site-wrap grid gap-8 py-14 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-cream p-6">
          <h2 className="text-2xl text-ink">{tx(lang, { en: "Where the rules live", zh: "辦法在哪裡" })}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "Deadlines, language requirements, available campuses, and majors change every term. The International Student Center publishes the global exchange call. Read that page before you plan a semester away.",
              zh: "每一學期的截止日、語言條件、開放學校與主修都會更新。請先看國際學生中心的全球交換生計畫，再安排出國學期。",
            })}
          </p>
          <ExternalLink href="http://isc.oie.fju.edu.tw/generalServices.jsp?labelID=39" className="mt-5 text-sm text-ink">
            {tx(lang, { en: "Global exchange program", zh: "全球交換生計畫" })}
          </ExternalLink>
        </article>
        <article className="rounded-2xl bg-ink p-6 text-cream">
          <h2 className="text-2xl text-cream">{tx(lang, { en: "Dual degree is the other path", zh: "另一條路是雙碩士" })}</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream/75">
            {tx(lang, {
              en: "If you want a second master’s, not only a semester of courses, use the dual-degree schedule. The two applications are not the same file.",
              zh: "如果要的是第二個碩士，而不只是一學期的課，請走雙碩士時程。兩種申請不是同一份文件。",
            })}
          </p>
          <Link
            href={withLang(lang, "/dual-degree")}
            className="mt-5 inline-flex text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
          >
            {tx(lang, { en: "Read the dual degree", zh: "閱讀跨國雙碩士" })}
          </Link>
        </article>
      </section>
    </>
  );
}

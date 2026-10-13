import { PageIntro } from "@/components/page-intro";
import { ExternalLink, TextLink } from "@/components/site-links";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "Overview and ranking", zh: "特色與排名" };
const description = {
  en: "Why Fu Jen’s English-taught MBA is accredited, ranked, and built around an international classroom.",
  zh: "輔大全英語 MBA 的認證、排名，以及國際化的學習環境。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const points = [
    {
      title: { en: "AACSB", zh: "AACSB" },
      body: {
        en: "The College of Management is AACSB accredited. About 5% of business schools worldwide hold that accreditation.",
        zh: "管理學院通過 AACSB。全球商管學院中，約 5% 持有這項認證。",
      },
    },
    {
      title: { en: "Eduniversal 2025", zh: "Eduniversal 2025" },
      body: {
        en: "In International Management, Fu Jen imMBA ranks in the top 3 in Taiwan and the top 20 in Far East Asia.",
        zh: "在 International Management 分類，輔大國際經管名列全台前 3、遠東地區前 20。",
      },
    },
    {
      title: { en: "More than 30 countries", zh: "三十多個國家" },
      body: {
        en: "Local and international students study together. In a course, the mix of local and international students can be about one to one.",
        zh: "本地生與國際生一起上課。同一門課裡，兩邊的人數有時接近一比一。",
      },
    },
    {
      title: { en: "Two master’s degrees in two years", zh: "兩年、兩個碩士" },
      body: {
        en: "A dual master’s with UM-Flint, KEDGE, or IQS can be finished in about two years, which is economical in time and in budget.",
        zh: "與密西根大學 Flint 分校、KEDGE 或 IQS 的雙碩士，約兩年可以完成，時間與費用都比較精省。",
      },
    },
  ];

  const paths = [
    {
      href: "/curriculum",
      title: { en: "The curriculum", zh: "課程與修業" },
      body: {
        en: "Marketing, operations, finance, human resources, technology, and strategy, with the timetable and graduation rules published by the office.",
        zh: "行銷、營運、財務、人力資源、科技與策略，課表與修業規則由所辦公布。",
      },
    },
    {
      href: "/dual-degree",
      title: { en: "A second master’s", zh: "跨國雙碩士" },
      body: {
        en: "Students who qualify can spend year two at UM-Flint, KEDGE, or IQS and earn two master’s degrees in about two years.",
        zh: "符合資格者第二年可前往密西根大學 Flint 分校、KEDGE 或 IQS，最快約兩年取得兩個碩士學位。",
      },
    },
    {
      href: "/exchange",
      title: { en: "Exchange without a second degree", zh: "免學費交換" },
      body: {
        en: "Students who do not want a dual degree can still apply for tuition-free exchange at Fu Jen’s partner universities.",
        zh: "不讀雙碩士的同學，仍可申請輔大全球姊妹校的免學費交換。",
      },
    },
  ];

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "About imMBA", zh: "關於國際經管" }}
        title={{ en: "Practical management, taught for a life that crosses borders.", zh: "為跨國工作而設計的管理訓練。" }}
        lede={{
          en: "The curriculum covers marketing, operations, finance, human resources, technology, and strategy, taught from a global perspective.",
          zh: "課程涵蓋行銷、營運、財務、人力資源、科技與策略，並從全球的角度來教。",
        }}
      />
      <section className="site-wrap grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            {tx(lang, {
              en: "imMBA is practical training in business and management, with international mobility built in. Students who are not taking the dual degree can still apply for Fu Jen’s tuition-free exchange through the International Student Center.",
              zh: "國際經管是實務取向的商管訓練，並把國際移動放進學程裡。不讀雙碩士的同學，仍可透過國際學生中心申請輔大的免學費交換。",
            })}
          </p>
          <p className="flex flex-col items-start gap-3">
            <ExternalLink href="https://www.aacsb.edu/accreditation">
              {tx(lang, { en: "AACSB accreditation", zh: "AACSB 國際商管認證" })}
            </ExternalLink>
            <ExternalLink href="https://best-masters.com/master-international-management-ranking/far-east-asia.html">
              {tx(lang, { en: "Eduniversal 2025 ranking", zh: "Eduniversal 2025 排名" })}
            </ExternalLink>
            <TextLink href={withLang(lang, "/regulations")}>
              {tx(lang, { en: "Program regulations", zh: "本單位規定及辦法" })}
            </TextLink>
            <TextLink href={withLang(lang, "/environment")}>
              {tx(lang, { en: "Learning environment", zh: "學習環境" })}
            </TextLink>
          </p>
        </div>
        <div className="grid gap-4">
          {points.map((point) => (
            <article key={point.title.en} className="rounded-2xl border border-border bg-cream p-5">
              <h2 className="text-2xl text-ink">{tx(lang, point.title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx(lang, point.body)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-border">
        <div className="site-wrap grid gap-4 py-14 md:grid-cols-3">
          {paths.map((item) => (
            <Link
              key={item.href}
              href={withLang(lang, item.href)}
              className="interactive-card rounded-2xl border-border bg-cream p-6"
            >
              <h2 className="font-display text-3xl text-ink">{tx(lang, item.title)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(lang, item.body)}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

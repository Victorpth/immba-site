import { PageIntro } from "@/components/page-intro";
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
      title: { en: "AACSB, and kept", zh: "AACSB，而且持續通過" },
      body: {
        en: "The College of Management earned AACSB accreditation in 2005, the first business school across the Taiwan Strait to do so, and passed continuing reviews in 2010, 2015, 2020, and 2025. About five percent of business schools worldwide hold this accreditation.",
        zh: "管理學院於 2005 年通過 AACSB，為兩岸第一所，並在 2010、2015、2020 與 2025 年持續通過。全球商管學院中，約僅 5% 持有這項認證。",
      },
    },
    {
      title: { en: "Eduniversal 2025", zh: "Eduniversal 2025" },
      body: {
        en: "In the International Management category, Fu Jen imMBA ranks in the top three in Taiwan and the top 20 in Far East Asia.",
        zh: "在 International Management 分類，輔大國際經管名列全台前三、遠東地區前二十。",
      },
    },
    {
      title: { en: "A Catholic university’s network", zh: "天主教大學的國際網絡" },
      body: {
        en: "Fu Jen belongs to Catholic and Jesuit university networks, including associations of Catholic universities, Jesuit universities, and Christian universities in Asia. That network is part of how the college meets partner schools.",
        zh: "輔大身為天主教大學，參與天主教大學聯盟、耶穌會大學聯盟與亞洲基督宗教大學聯盟。這些網絡也是學院認識合作學校的途徑。",
      },
    },
    {
      title: { en: "English since 2014", zh: "2014 年起全面英語授課" },
      body: {
        en: "The program opened in 2006, when the Ministry of Education selected Fu Jen alongside National Taiwan University and National Chengchi University to pilot a professional business school. From academic year 2014, every imMBA course has been taught in English.",
        zh: "學程於 2006 年成立。當年教育部遴選輔大與臺灣大學、政治大學同步試辦商管專業學院。自 103 學年度起，國際經管所有課程以英語授課。",
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
          en: "The curriculum connects marketing, operations, finance, people, technology, and strategy, so graduates can move in an economy that is already international.",
          zh: "課程把行銷、營運、財務、人才、科技與策略放在一起，讓畢業生能在已經國際化的經濟裡移動。",
        }}
      />
      <section className="site-wrap grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "In 2021 the college was selected for the Ministry of Education’s bilingual-learning program. Among 76 applicant colleges, it was the only private university college of management in greater Taipei to receive the grant.",
              zh: "2021 年，管理學院獲教育部「大專校院學生雙語化學習計畫」核定為重點培育學院。在 76 個申請學院中，是大台北地區唯一獲補助的私立大學管理學院。",
            })}
          </p>
          <a
            href="https://best-masters.com/master-international-management-ranking/far-east-asia.html"
            className="mt-6 inline-flex text-sm underline underline-offset-4"
          >
            Eduniversal 2025
          </a>
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
          {[
            { href: "/environment", en: "Where you study", zh: "學習環境" },
            { href: "/curriculum", en: "What you take", zh: "課程與修業" },
            { href: "/admissions", en: "How you enter", zh: "如何申請" },
          ].map((item) => (
            <Link key={item.href} href={withLang(lang, item.href)} className="rounded-2xl bg-ink p-6 text-cream">
              <span className="font-display text-3xl">{lang === "zh" ? item.zh : item.en}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

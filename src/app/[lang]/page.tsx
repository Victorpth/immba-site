import { PublicAnnouncements } from "@/components/public-announcements";
import { ActionLink, AnnouncementSource, TextLink } from "@/components/site-links";
import { primaryMenu } from "@/content/nav";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = {
  en: "imMBA · Fu Jen Catholic University",
  zh: "輔仁大學國際經營管理碩士班",
};
const description = {
  en: "An AACSB-accredited MBA taught entirely in English, with dual-degree routes in the United States, France, and Spain.",
  zh: "AACSB 認證、全英語授課的 MBA，並可銜接美國、法國與西班牙的雙碩士。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const facts = [
  { en: "Top 3", zh: "全台前 3", note: { en: "in Taiwan, International Management", zh: "International Management" } },
  { en: "Top 20", zh: "遠東前 20", note: { en: "Far East Asia, Eduniversal 2025", zh: "Eduniversal 2025" } },
  { en: "30+", zh: "30+", note: { en: "countries in the classroom", zh: "個國家的同學" } },
  { en: "42", zh: "42", note: { en: "credits, including the thesis", zh: "畢業學分，含論文" } },
];

const pillars = [
  {
    href: "/about",
    enTitle: "An English MBA with a global classroom",
    zhTitle: "全英語，課堂就是國際",
    en: "Local and international students study together. The mix in a course can be close to one to one.",
    zh: "本地生與國際生合班。同一門課的比例可以接近一比一。",
  },
  {
    href: "/dual-degree",
    enTitle: "Two master’s degrees in two years",
    zhTitle: "兩年，可以是兩個碩士",
    en: "Stay at Fu Jen, or spend the second year at UM-Flint, KEDGE, or IQS.",
    zh: "可以全程在輔大，也可以第二年前往 UM-Flint、KEDGE 或 IQS。",
  },
  {
    href: "/curriculum",
    enTitle: "Management, plus the tools of this decade",
    zhTitle: "管理本業，加上這個十年的工具",
    en: "Marketing, finance, supply chains, and new courses in data analytics and AI-built products.",
    zh: "行銷、財務、供應鏈，以及數據分析與 AI 產品開發等新課。",
  },
  {
    href: "/exchange",
    enTitle: "Exchange, if a second degree is not the plan",
    zhTitle: "不想讀雙學位，仍可交換",
    en: "Fu Jen’s partner universities offer tuition-free exchange for a term abroad.",
    zh: "輔大姊妹校提供免學費的出國交換。",
  },
];

const menuGroups = primaryMenu.filter((item) => item.children && item.children.length > 0);

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <p
          aria-hidden
          className="pointer-events-none absolute top-6 right-0 hidden font-display text-[7rem] leading-none tracking-tight text-ink/5 lg:block"
        >
          WITH imMBA
        </p>
        <div className="site-wrap py-16 lg:py-24">
          <p className="text-xs font-semibold tracking-[0.22em] text-burgundy uppercase">
            {tx(lang, { en: "New Taipei City · Taught in English", zh: "新北市 · 全英語授課" })}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl text-ink sm:text-5xl lg:text-6xl">
            {tx(lang, {
              en: "An MBA built for careers that cross borders.",
              zh: "為跨境職涯而設的 MBA。",
            })}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-ink">
            {tx(lang, {
              en: "Fu Jen’s International MBA is taught entirely in English and accredited by AACSB. You learn management with people who did not grow up in the same country.",
              zh: "輔大國際經營管理碩士班全英語授課，並通過 AACSB 認證。你和來自不同國家的人一起學管理。",
            })}
          </p>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[#243044]">
            {tx(lang, {
              en: "You study with classmates from more than 30 countries, and you can earn a second master’s in the United States, France, or Spain.",
              zh: "同學來自三十多個國家；也可以在美國、法國或西班牙再取得一個碩士。",
            })}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ActionLink href={withLang(lang, "/admissions")}>
              {tx(lang, { en: "Apply Now", zh: "立即報名" })}
            </ActionLink>
            <TextLink href={withLang(lang, "/marketplace")}>
              {tx(lang, { en: "Books and materials marketplace", zh: "書籍與教材市集" })}
            </TextLink>
          </div>
          <div className="mt-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-burgundy uppercase">
              {tx(lang, { en: "The program in numbers", zh: "學程一覽" })}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.en}>
                  <p className="font-display text-4xl text-ink">{tx(lang, { en: fact.en, zh: fact.zh })}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{tx(lang, fact.note)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-wrap py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
              {tx(lang, { en: "The program", zh: "學程" })}
            </p>
            <h2 className="mt-3 max-w-lg text-4xl text-ink">
              {tx(lang, { en: "What two years here are for", zh: "這兩年用來做什麼" })}
            </h2>
          </div>
          <TextLink href={withLang(lang, "/about")} className="hidden sm:inline">
            {tx(lang, { en: "Overview and ranking", zh: "特色與排名" })}
          </TextLink>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {pillars.map((pillar, index) => (
            <Link
              key={pillar.href}
              href={withLang(lang, pillar.href)}
              className="interactive-card group rounded-2xl border-border bg-cream p-6"
            >
              <p className="text-xs text-gold">0{index + 1}</p>
              <h3 className="mt-3 text-2xl text-ink group-hover:text-burgundy">
                {lang === "zh" ? pillar.zhTitle : pillar.enTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {lang === "zh" ? pillar.zh : pillar.en}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-cream/60">
        <div className="site-wrap py-16 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
            {tx(lang, { en: "On this site", zh: "本站導覽" })}
          </p>
          <h2 className="mt-3 text-4xl text-ink">{tx(lang, { en: "About, admissions, and courses", zh: "關於、招生與課程" })}</h2>
          <div className="mt-10 space-y-10">
            {menuGroups.map((group) => (
              <div key={group.href}>
                <h3 className="text-sm font-semibold tracking-[0.16em] text-burgundy uppercase">{tx(lang, group.label)}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.children?.map((child) => (
                    <Link
                      key={child.href}
                      href={withLang(lang, child.href)}
                      className="interactive-card rounded-2xl border-border bg-cream p-5"
                    >
                      <p className="text-lg text-ink">{tx(lang, child.label)}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx(lang, child.description)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-wrap py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
              {tx(lang, { en: "Announcements", zh: "公告" })}
            </p>
            <h2 className="mt-3 text-4xl text-ink">{tx(lang, { en: "Latest from the office", zh: "所辦最新消息" })}</h2>
          </div>
          <TextLink href={withLang(lang, "/news")}>{tx(lang, { en: "All announcements", zh: "全部公告" })}</TextLink>
        </div>
        <div className="mt-8">
          <PublicAnnouncements lang={lang} />
        </div>
        <div className="mt-8">
          <AnnouncementSource lang={lang} />
        </div>
      </section>

      <section className="border-t border-border bg-cream/40">
        <div className="site-wrap py-16 sm:py-20">
          <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">
            {tx(lang, { en: "Second year abroad", zh: "第二年在國外" })}
          </p>
          <h2 className="mt-3 max-w-xl text-4xl text-ink">
            {tx(lang, { en: "Three schools. One extra degree.", zh: "三所學校，一個額外的碩士。" })}
          </h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              {
                city: { en: "Flint, USA", zh: "美國 Flint" },
                school: "University of Michigan–Flint",
                degree: "MBA",
                note: { en: "In-state tuition for imMBA students.", zh: "國際經管學生適用州內學費。" },
              },
              {
                city: { en: "Bordeaux or Marseille", zh: "波爾多或馬賽" },
                school: "KEDGE Business School",
                degree: "Master in Management",
                note: { en: "Study at KEDGE without KEDGE tuition.", zh: "在 KEDGE 就讀免收該校學費。" },
              },
              {
                city: { en: "Barcelona", zh: "巴塞隆納" },
                school: "IQS School of Management",
                degree: "MIMDE · MIBM",
                note: { en: "A tuition discount under the agreement.", zh: "依合約享有學費優惠。" },
              },
            ].map((partner) => (
              <Link
                key={partner.school}
                href={withLang(lang, "/dual-degree")}
                className="interactive-card flex h-full flex-col rounded-2xl border-white/15 bg-ink p-6 text-cream"
              >
                <p className="text-xs tracking-[0.16em] text-gold uppercase">{tx(lang, partner.city)}</p>
                <h3 className="mt-4 text-2xl text-cream">{partner.school}</h3>
                <p className="mt-2 text-base text-cream">{partner.degree}</p>
                <p className="mt-6 text-base leading-relaxed text-cream/90">{tx(lang, partner.note)}</p>
                <span className="mt-6 text-sm text-gold">{tx(lang, { en: "Read the pathway", zh: "閱讀路徑說明" })}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { PageIntro } from "@/components/page-intro";
import { ExternalLink, TextLink } from "@/components/site-links";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "imMBA guide", zh: "imMBA 全攻略" };
const description = {
  en: "The official English imMBA Guide page has no article posted. The program facts are on the pages the office does publish.",
  zh: "官方英文 imMBA Guide 目前沒有刊登文章。學程資料在所辦已公布的頁面。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const links = [
  { href: "/about", en: "Overview and ranking", zh: "特色與排名" },
  { href: "/admissions", en: "Apply for Fu Jen imMBA", zh: "招生資訊" },
  { href: "/curriculum", en: "Curriculum and requirements", zh: "課程與修業規則" },
  { href: "/dual-degree", en: "Dual degree", zh: "跨國雙碩士" },
  { href: "/graduation", en: "Graduation", zh: "畢業與離校" },
  { href: "/exchange", en: "Exchange", zh: "海外交換" },
];

export default async function GuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Student guide", zh: "全攻略" }}
        title={{ en: "The official guide page has no article yet.", zh: "官方全攻略頁目前沒有文章。" }}
        lede={{
          en: "On the English imMBA site, the Guide page is published with a title and no body text. The facts a new student needs are on the pages below.",
          zh: "英文官方網站的 imMBA Guide 有標題，沒有內文。新生需要的資料在下列頁面。",
        }}
      />
      <section className="site-wrap py-14">
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((item) => (
            <li key={item.href}>
              <TextLink href={withLang(lang, item.href)} className="text-base">
                {tx(lang, { en: item.en, zh: item.zh })}
              </TextLink>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <ExternalLink
            href="https://www.management.fju.edu.tw/esubweb/immbaengindex/subedit.php?EID=35"
            className="text-sm text-ink"
          >
            {tx(lang, { en: "Official imMBA Guide page", zh: "官方 imMBA Guide 頁" })}
          </ExternalLink>
        </p>
      </section>
    </>
  );
}

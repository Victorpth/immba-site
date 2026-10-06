import { PageIntro } from "@/components/page-intro";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Learning environment", zh: "學習環境" };
const description = {
  en: "Guoxi Building, the college floors, the library, and how to reach the Fu Jen campus.",
  zh: "國璽樓、管理學院樓層、圖書館，以及如何抵達輔大。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function EnvironmentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  const places = [
    {
      title: { en: "Two metro lines", zh: "雙捷運交會" },
      body: {
        en: "The campus sits where two metro lines meet, so greater Taipei is straightforward, and the airport line makes a weekend flight less of a project.",
        zh: "校園位於雙捷運交會處，往返大台北直接，機場捷運也讓出國沒有那麼費事。",
      },
    },
    {
      title: { en: "Guoxi Building", zh: "國璽樓" },
      body: {
        en: "The lobby is wide and bright, with a café on the ground. imMBA classes are often on the college floors, 10 to 12, with newer rooms and a view over the campus.",
        zh: "一樓大廳寬敞，有咖啡香。國際經管的學習空間多半安排在管理學院的 10 到 12 樓，教室新，也可以俯瞰校園。",
      },
    },
    {
      title: { en: "Library, floors 3 to 5", zh: "圖書館在 3 到 5 樓" },
      body: {
        en: "The same building holds a large library. The self-study center on the fifth floor is for quieter work and making things.",
        zh: "同一棟樓的 3 到 5 樓是圖書館。五樓的自學中心適合安靜讀書，也適合動手做。",
      },
    },
    {
      title: { en: "The office", zh: "所辦" },
      body: {
        en: "The imMBA office is LM208-1. Admissions guides are kept there, and Secretary Chang answers +886 2 2905 2750.",
        zh: "國際經管辦公室在 LM208-1。招生指南可以在這裡索取，張秘書電話是 +886 2 2905 2750。",
      },
    },
  ];

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Campus", zh: "校園" }}
        title={{ en: "A hilltop campus, twenty minutes from the city grid.", zh: "在山坡上的校園，接得上城市。" }}
        lede={{
          en: "Xinzhuang, New Taipei City. The college looks down across Fu Jen, and the airport metro is the practical way out to the world.",
          zh: "新北市新莊。管理學院俯瞰輔大校園，機場捷運則是實際通往世界的路。",
        }}
      />
      <section className="site-wrap grid gap-4 py-14 md:grid-cols-2">
        {places.map((place) => (
          <article key={place.title.en} className="rounded-2xl border border-border bg-cream p-6">
            <h2 className="text-2xl text-ink">{tx(lang, place.title)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(lang, place.body)}</p>
          </article>
        ))}
      </section>
      <section className="border-t border-border">
        <div className="site-wrap flex flex-col gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "No. 510, Zhongzheng Road, Xinzhuang District, New Taipei City.",
              zh: "新北市新莊區中正路 510 號。",
            })}
          </p>
          <a
            className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm text-primary-foreground"
            href="https://maps.google.com/?q=Fu+Jen+Catholic+University"
          >
            {tx(lang, { en: "Open the map", zh: "開啟地圖" })}
          </a>
        </div>
      </section>
    </>
  );
}

import { PageIntro } from "@/components/page-intro";
import { ExternalLink } from "@/components/site-links";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Learning environment", zh: "學習環境" };
const description = {
  en: "The Guoxi Building lobby, tenth-floor classrooms, and the Fun self-study center published by imMBA.",
  zh: "國際經管公布的國璽樓大廳、十樓教室與 Fun 學趣自學中心。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const photos = [
  {
    src: "/environment/floor.jpg",
    alt: {
      en: "Guoxi Building (MD), first-floor lobby",
      zh: "國璽樓（MD）1 樓大廳",
    },
  },
  {
    src: "/environment/campus-1.jpg",
    alt: {
      en: "Guoxi Building (MD), tenth floor: lobby, multimedia classroom, discussion room, and classroom",
      zh: "國璽樓（MD）10 樓大廳、多功能影音教室、小組討論室與專業教室",
    },
  },
  {
    src: "/environment/campus-2.jpg",
    alt: {
      en: "Guoxi Building (MD), Fun self-study center",
      zh: "國璽樓（MD）Fun 學趣自學中心",
    },
  },
  {
    src: "/environment/seminar-room.jpg",
    compact: true,
    alt: {
      en: "A seminar classroom, with tables and chairs set for class",
      zh: "研討教室，課桌與椅子已排好準備上課",
    },
  },
];

export default async function EnvironmentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Campus", zh: "校園" }}
        title={{ en: "Guoxi Building, as the office shows it.", zh: "國璽樓，以所辦公布的照片為準。" }}
        lede={{
          en: "The official learning-environment page shows the first-floor lobby, the tenth-floor rooms, and the Fun self-study center. A seminar classroom is included with them.",
          zh: "官方學習環境頁有一樓大廳、十樓教室，以及 Fun 學趣自學中心。同一組照片裡也有一間研討教室。",
        }}
      />
      <section className="site-wrap grid gap-8 py-14">
        {photos.map((photo) => (
          <figure
            key={photo.src}
            className={`overflow-hidden rounded-2xl border border-border bg-cream ${"compact" in photo && photo.compact ? "mx-auto w-full max-w-xl" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.src} alt={tx(lang, photo.alt)} className="w-full" />
            <figcaption className="px-5 py-4 text-sm text-muted-foreground">{tx(lang, photo.alt)}</figcaption>
          </figure>
        ))}
      </section>
      <section className="border-t border-border">
        <div className="site-wrap flex flex-col gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {tx(lang, {
              en: "No. 510, Zhongzheng Road, Xinzhuang District, New Taipei City 24205.",
              zh: "24205 新北市新莊區中正路 510 號。",
            })}
          </p>
          <ExternalLink
            href="https://www.management.fju.edu.tw/esubweb/immbaengindex/profile.php?IID=36"
            className="text-sm text-ink"
          >
            {tx(lang, { en: "Official learning environment page", zh: "官方學習環境頁" })}
          </ExternalLink>
        </div>
      </section>
    </>
  );
}

import { FacultyBrowser } from "@/components/faculty-browser";
import { PageIntro } from "@/components/page-intro";
import { getAccess, isStaff } from "@/lib/auth-access";
import { listFaculty } from "@/lib/faculty-server";
import { tx, isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Faculty", zh: "師資介紹" };
const description = {
  en: "Full-time and part-time faculty of the MBA in International Management.",
  zh: "國際經營管理碩士班專任與兼任教師。",
};

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function FacultyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;
  let people: Awaited<ReturnType<typeof listFaculty>> = [];
  let unavailable = false;
  let canManage = false;
  try {
    people = await listFaculty();
  } catch {
    unavailable = true;
  }
  try {
    canManage = isStaff(await getAccess());
  } catch {
    canManage = false;
  }

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "People", zh: "師資" }}
        title={{ en: "The faculty who teach the English MBA.", zh: "在全英語課堂上課的老師。" }}
        lede={{
          en: "Search by name or field. Extensions are dialed from the Fu Jen campus phone system.",
          zh: "可依姓名或專長搜尋。分機請由輔大總機轉接。",
        }}
      />
      <section className="site-wrap py-14">
        {unavailable ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            {tx(lang, {
              en: "The faculty list is unavailable right now.",
              zh: "師資名單目前無法載入。",
            })}
          </p>
        ) : (
          <FacultyBrowser lang={lang} people={people} canManage={canManage} />
        )}
      </section>
    </>
  );
}

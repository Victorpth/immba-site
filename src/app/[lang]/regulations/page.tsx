import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { isLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Regulations", zh: "規定及辦法" };
const description = {
  en: "Program meeting rules, the curriculum committee, and the imMBA scholarship regulations.",
  zh: "學程會議設置辦法、課委會設置辦法與學生獎助學金辦法。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function RegulationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Governance", zh: "辦法" }}
        title={{ en: "How the program decides, and how aid is given.", zh: "學程怎麼開會，獎助怎麼發給。" }}
        lede={{
          en: "Three regulations are published for students and faculty: the program meeting, the curriculum committee, and student scholarships.",
          zh: "對學生與教師公開的三份辦法：學程會議、課程委員會，以及學生獎助學金。",
        }}
      />
      <section className="site-wrap py-14">
        <DocList lang={lang} group="regulations" />
      </section>
    </>
  );
}

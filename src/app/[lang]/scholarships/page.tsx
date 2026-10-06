import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import { notFound } from "next/navigation";

const title = { en: "Tuition and scholarships", zh: "學雜費與獎助學金" };
const description = {
  en: "International tuition, the local rate, and the four scholarships an imMBA student may be considered for.",
  zh: "外國學生學雜費、本地生費率，以及國際經管相關的四項獎學金。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

const rows = [
  {
    name: { en: "International standard", zh: "外國學生標準收費" },
    amount: "NT$123,000",
    note: { en: "Tuition and fees, per semester.", zh: "每學期學雜費。" },
  },
  {
    name: { en: "MOE, MOFA, or FJCU new-student scholarship", zh: "教育部、外交部或輔大碩士新生獎學金" },
    amount: "NT$68,660",
    note: {
      en: "imMBA moves the fee from the international rate to the local rate while the award is active. Government awards: up to two years. FJCU award: up to four consecutive semesters. A leave of absence ends the reduction.",
      zh: "獲獎期間，國際經管另將學雜費由外國學生費率改為本地生費率。政府獎學金最長兩年；輔大獎學金連續最多四個學期。休學或中斷即喪失這項減免。",
    },
  },
  {
    name: { en: "President’s Scholarship", zh: "校長獎學金" },
    amount: "NT$82,400",
    note: {
      en: "A reduction of NT$40,600 per semester, up to four consecutive semesters. No separate form. It is applied on the bill for new international students from an English-speaking country, or with TOEFL iBT 72, IELTS 6, or TOEIC 785 (CEFR B2) from the past two years.",
      zh: "每學期減免新台幣 40,600 元，連續最多四個學期，不必另提申請，直接反映在繳費單。對象為來自英語系國家，或兩年內托福 iBT 72、雅思 6、多益 785（CEFR B2）的國際新生。",
    },
  },
];

export default async function ScholarshipsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Fees", zh: "費用" }}
        title={{ en: "One scholarship at a time. The bill shows which one.", zh: "四項獎學金擇一，費率寫在繳費單上。" }}
        lede={{
          en: "International tuition is NT$123,000 per semester. Eligible students are considered for a government scholarship, the Fu Jen master’s scholarship, or the President’s Scholarship. A student receives only one of the four.",
          zh: "外國學生每學期學雜費新台幣 123,000 元。符合資格者可適用教育部獎學金、外交部獎學金、輔大碩士新生獎學金或校長獎學金，四者只能領取其中一項。",
        }}
      />
      <section className="site-wrap py-14">
        <div className="grid gap-4">
          {rows.map((row) => (
            <article key={row.amount + row.name.en} className="grid gap-3 rounded-2xl border border-border bg-cream p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-2xl text-ink">{tx(lang, row.name)}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tx(lang, row.note)}</p>
              </div>
              <p className="font-display text-3xl text-burgundy">{row.amount}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {tx(lang, {
            en: "Local tuition is published on the university fee site. Links to the imMBA scholarship regulations, teaching assistantships, and the study-abroad awards are collected below.",
            zh: "本地生學雜費以學校收費網站為準。國際經管獎助辦法、教學助理助學金與學海獎學金連結列於下方。",
          })}
        </p>
        <div className="mt-8">
          <DocList lang={lang} group="scholarships" />
        </div>
        <Link href={withLang(lang, "/admissions")} className="mt-8 inline-flex text-sm underline underline-offset-4">
          {tx(lang, { en: "Back to admissions", zh: "返回招生資訊" })}
        </Link>
      </section>
    </>
  );
}

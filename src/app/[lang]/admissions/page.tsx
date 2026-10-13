import { CycleStatus } from "@/components/cycle-status";
import { DocList } from "@/components/doc-list";
import { PageIntro } from "@/components/page-intro";
import { ActionLink, ExternalLink, ResourceLink, TextLink } from "@/components/site-links";
import { cycles } from "@/content/cycles";
import { isLang, tx, withLang } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Admissions", zh: "招生資訊" };
const description = {
  en: "International and local routes into Fu Jen’s English-taught MBA, with current windows and document lists.",
  zh: "外國學生與本地生申請輔大全英語 MBA 的管道、期限與文件。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function AdmissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Admissions", zh: "招生" }}
        title={{ en: "Two doors in. The same English classroom.", zh: "兩種入學方式，進到同一間英語教室。" }}
        lede={{
          en: "International students apply through Fu Jen’s international system, in spring or fall. Local students apply through screening in October or the master’s intake in January. Neither local route has a written exam.",
          zh: "外國學生經由輔大外國學生系統，於春季或秋季入學。本地生可參加十月甄試或一月碩士招生，兩種管道都免筆試，適合不同大學主修、想加強國際移動力的同學。",
        }}
      />

      <nav aria-label={tx(lang, { en: "On this page", zh: "本頁目錄" })} className="site-wrap flex gap-6 py-6 text-sm">
        <a href="#international" className="text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]">
          {tx(lang, { en: "International students", zh: "外國學生" })}
        </a>
        <a href="#local" className="text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86]">
          {tx(lang, { en: "Local students", zh: "本地生" })}
        </a>
      </nav>

      <section id="international" className="scroll-mt-28 border-t border-border">
        <div className="site-wrap grid gap-10 py-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl text-ink">{tx(lang, { en: "International students", zh: "外國學生" })}</h2>
              <CycleStatus cycle={cycles[0]} lang={lang} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "All courses are in English. You may choose the two-year Fu Jen degree, or a dual master’s: year one at Fu Jen and year two at UM-Flint, KEDGE, or IQS. Partner schools charge their own tuition, in full or in part, and both universities must be satisfied before two degrees are awarded.",
                zh: "所有課程以英語進行。可以選擇兩年輔大學位，或雙碩士：第一年在輔大，第二年在密西根大學 Flint 分校、KEDGE 或 IQS。合作學校另收全額或部分學費，兩校畢業條件都完成才授予兩個學位。",
              })}
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-ink">{tx(lang, { en: "Spring 2027", zh: "2027 春季班" })}</dt>
                <dd className="text-muted-foreground">
                  {tx(lang, {
                    en: "Open now. Apply from 14 September to 14 October 2026. Spring windows are usually mid-October to late December.",
                    zh: "目前開放。報名期間為 2026 年 9 月 14 日至 10 月 14 日。春季班通常約在 10 月中至 12 月下旬。",
                  })}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink">{tx(lang, { en: "Fall window", zh: "秋季班" })}</dt>
                <dd className="text-muted-foreground">
                  {tx(lang, {
                    en: "Usually January to June.",
                    zh: "通常約 1 月至 6 月。",
                  })}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ActionLink href="http://idsasys.oie.fju.edu.tw/">
                {tx(lang, { en: "Apply Online", zh: "線上報名" })}
              </ActionLink>
              <ResourceLink href="http://idsa.oie.docs.fju.edu.tw/Spring2027/FJCU_115-2Admission.pdf">
                {tx(lang, { en: "Spring 2027 Admission Guide", zh: "2027 春季班招生簡章" })}
              </ResourceLink>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "International tuition is NT$123,000 per semester. Eligible students may be considered for a government scholarship, the Fu Jen master’s scholarship, or the President’s Scholarship. A student receives only one of the four.",
                zh: "外國學生每學期學雜費新台幣 123,000 元。符合資格者可適用教育部獎學金、外交部獎學金、輔大碩士新生獎學金或校長獎學金，四者只能領取其中一項。",
              })}{" "}
              <TextLink href={withLang(lang, "/scholarships")}>
                {tx(lang, { en: "Tuition and scholarships", zh: "學雜費與獎助學金" })}
              </TextLink>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-cream p-6">
            <h3 className="text-xl text-ink">
              {tx(lang, { en: "Materials for the current spring round", zh: "本梯次春季班強調的文件" })}
            </h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>{tx(lang, { en: "Autobiography, in English", zh: "英文自傳" })}</li>
              <li>{tx(lang, { en: "Study plan, in English", zh: "英文讀書計畫" })}</li>
              <li>
                {tx(lang, {
                  en: "English certificate such as TOEFL, IELTS, or TOEIC. CEFR B2 is preferred.",
                  zh: "英語能力證明，如托福、雅思或多益。建議達 CEFR B2。",
                })}
              </li>
              <li>{tx(lang, { en: "Two recommendation letters", zh: "推薦信兩封" })}</li>
              <li>{tx(lang, { en: "Anything else that strengthens the file", zh: "其他有助審查的資料" })}</li>
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "The admission brochure is the full checklist. This track is open to international students only. Applicants who are not international students use the local admissions information below.",
                zh: "完整清單以招生簡章為準。這一軌只開放給外國學生。非外國學生請看下方的本地生招生資訊。",
              })}
            </p>
          </div>
        </div>
      </section>

      <section id="local" className="scroll-mt-28 border-t border-border bg-cream/50">
        <div className="site-wrap grid gap-10 py-14 lg:grid-cols-[1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl text-ink">{tx(lang, { en: "Local students", zh: "本地生" })}</h2>
              <CycleStatus cycle={cycles[1]} lang={lang} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "Local students have two intakes each year, both without a written test. Review looks at the study plan, English score, transcript, and recommendation. The interview is mainly in English, with Chinese as support. This route suits applicants from any undergraduate major who want to build a career in management.",
                zh: "本地生每年有十月甄試與一月碩士招生，皆免筆試。書審綜合讀書計畫、英檢、成績單與推薦信；口試以英文為主、中文為輔。適合大學不同主修、想在商業管理領域發展的同學。",
              })}
            </p>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-cream">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="bg-muted text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium" />
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Screening", zh: "甄試" })}</th>
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Master’s intake", zh: "碩士招生" })}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Apply", zh: "報名" })}</th>
                    <td className="px-4 py-3">{tx(lang, { en: "October", zh: "每年 10 月" })}</td>
                    <td className="px-4 py-3">{tx(lang, { en: "January", zh: "每年 1 月" })}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Interview", zh: "口試" })}</th>
                    <td className="px-4 py-3">{tx(lang, { en: "November", zh: "11 月" })}</td>
                    <td className="px-4 py-3">{tx(lang, { en: "March", zh: "3 月" })}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Results", zh: "放榜" })}</th>
                    <td className="px-4 py-3">{tx(lang, { en: "December", zh: "12 月" })}</td>
                    <td className="px-4 py-3">{tx(lang, { en: "March", zh: "3 月" })}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <th className="px-4 py-3 font-medium">{tx(lang, { en: "Entry", zh: "入學" })}</th>
                    <td className="px-4 py-3">
                      {tx(lang, { en: "February or September", zh: "2 月或 9 月" })}
                    </td>
                    <td className="px-4 py-3">{tx(lang, { en: "September", zh: "9 月" })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "AY116 screening registration: 30 September 2026, 10:00, through 13 October 2026, 12:00. Admitted students may enter in the spring term of this academic year, if they already hold a bachelor’s diploma, or in the fall of the following academic year. The interview notice is not posted yet.",
                zh: "116 學年度甄試網路報名：2026 年 9 月 30 日 10:00 至 10 月 13 日 12:00。錄取後可於該學年度第二學期提早入學（須已取得大學畢業證書），或於次學年度第一學期入學。口試通知尚未公布。",
              })}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ActionLink href="https://exam.fju.edu.tw/admission/251">
                {tx(lang, { en: "Register for Screening", zh: "報名甄試" })}
              </ActionLink>
              <ResourceLink href="https://www.management.fju.edu.tw/smarteditupfiles/immba/116%20imMBA.pdf">
                {tx(lang, { en: "AY116 Screening Guide", zh: "116 甄試簡版簡章" })}
              </ResourceLink>
              <ExternalLink href="https://exam.fju.edu.tw/admission/251" className="text-sm text-ink">
                {tx(lang, { en: "AY116 full screening brochure", zh: "116 甄試完整簡章" })}
              </ExternalLink>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-cream p-6">
            <h3 className="text-xl text-ink">{tx(lang, { en: "Local file", zh: "甄試應備資料" })}</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <ResourceLink href="https://www.management.fju.edu.tw/smarteditupfiles/immba/116%200819.doc">
                  {tx(lang, { en: "Written-review form", zh: "書面資料審查表" })}
                </ResourceLink>
              </li>
              <li>{tx(lang, { en: "Copy of the national ID", zh: "國民身分證影本" })}</li>
              <li>{tx(lang, { en: "Copy of the degree certificate", zh: "學位證書影本" })}</li>
              <li>{tx(lang, { en: "Undergraduate transcripts", zh: "學士班歷年成績單" })}</li>
              <li>
                <ResourceLink href="https://www.management.fju.edu.tw/smarteditupfiles/immba/1121(1).pdf">
                  {tx(lang, { en: "Autobiography and study plan", zh: "自傳暨讀書計畫" })}
                </ResourceLink>
              </li>
              <li>{tx(lang, { en: "One recommendation letter", zh: "推薦信一封" })}</li>
              <li>{tx(lang, { en: "Proof of English", zh: "英文能力證明" })}</li>
              <li>{tx(lang, { en: "Other helpful material", zh: "其他有助審查的資料" })}</li>
            </ol>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "Fees are published on the university tuition site. Scholarship rules, including the imMBA student aid regulations, are on the scholarships page.",
                zh: "學雜費以學校收費網站為準。獎助辦法，包括國際經管學生獎助學金辦法，列在獎助學金頁。",
              })}
            </p>
            <p className="mt-3 flex flex-col items-start gap-2 text-sm">
              <ExternalLink href="http://tuition.ga.fju.edu.tw/lnchargeStudent/index.jsp">
                {tx(lang, { en: "University tuition lookup", zh: "學雜費查詢" })}
              </ExternalLink>
              <TextLink href={withLang(lang, "/scholarships")}>
                {tx(lang, { en: "Tuition and scholarships", zh: "學雜費與獎助學金" })}
              </TextLink>
              <ExternalLink href="https://academic.fju.edu.tw/teachingServices.jsp?labelID=24">
                {tx(lang, { en: "Course waiver regulations", zh: "學生抵免科目規則" })}
              </ExternalLink>
            </p>
          </div>
        </div>
      </section>

      <section className="site-wrap py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-3xl text-ink">{tx(lang, { en: "Brochures and forms", zh: "簡章與表格" })}</h2>
          <TextLink href={withLang(lang, "/scholarships")}>
            {tx(lang, { en: "Fees and scholarships", zh: "學雜費與獎學金" })}
          </TextLink>
        </div>
        <DocList lang={lang} group="admissions" />
      </section>
    </>
  );
}

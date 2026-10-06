import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { isLang, tx } from "@/lib/i18n";
import { pageMeta } from "@/lib/meta";
import { notFound } from "next/navigation";

const title = { en: "Contact", zh: "聯絡我們" };
const description = {
  en: "Write to the imMBA office at Fu Jen Catholic University.",
  zh: "聯絡輔仁大學國際經營管理碩士班辦公室。",
};

export function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return pageMeta(params, title, description);
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang = raw;

  return (
    <>
      <PageIntro
        lang={lang}
        eyebrow={{ en: "Office", zh: "所辦" }}
        title={{ en: "LM208-1. A person answers.", zh: "LM208-1，有人會回信。" }}
        lede={{
          en: "Secretary Chang handles the office line. Use the form to open an email, or write directly.",
          zh: "辦公室由張秘書接聽。可用表單開啟信件，或直接寫信。",
        }}
      />
      <section className="site-wrap grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">
              {tx(lang, { en: "Phone", zh: "電話" })}
            </p>
            <a className="mt-2 block text-2xl text-ink" href="tel:+886229052750">
              +886 2 2905 2750
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">
              {tx(lang, { en: "Email", zh: "信箱" })}
            </p>
            <a className="mt-2 block text-lg text-ink" href="mailto:imMBA@mail.fju.edu.tw">
              imMBA@mail.fju.edu.tw
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">
              {tx(lang, { en: "Visit", zh: "地址" })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tx(lang, {
                en: "LM208-1, No. 510, Zhongzheng Rd., Xinzhuang District, New Taipei City 242062",
                zh: "242062 新北市新莊區中正路 510 號 LM208-1",
              })}
            </p>
            <a
              className="mt-3 inline-flex text-sm underline underline-offset-4"
              href="https://maps.google.com/?q=Fu+Jen+Catholic+University+510+Zhongzheng"
            >
              {tx(lang, { en: "Map", zh: "地圖" })}
            </a>
          </div>
        </aside>
        <ContactForm lang={lang} />
      </section>
    </>
  );
}

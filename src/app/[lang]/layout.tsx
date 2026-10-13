import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SetLang } from "@/components/set-lang";
import { isLang, tx, type Lang } from "@/lib/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const current: Lang = isLang(lang) ? lang : "en";
  return {
    title: {
      default: tx(current, {
        en: "imMBA · Fu Jen Catholic University",
        zh: "輔仁大學國際經營管理碩士班 imMBA",
      }),
      template: tx(current, { en: "%s · FJCU imMBA", zh: "%s · 輔大 imMBA" }),
    },
    description: tx(current, {
      en: "The AACSB-accredited, English-taught MBA in International Management at Fu Jen Catholic University.",
      zh: "輔仁大學管理學院國際經營管理碩士班，AACSB 認證、全英語授課。",
    }),
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <a className="skip-link" href="#content">
        {tx(lang, { en: "Skip to content", zh: "跳至主要內容" })}
      </a>
      <SetLang lang={lang} />
      <SiteHeader lang={lang} />
      <main id="content" className="flex-1">{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}

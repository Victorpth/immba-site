import { isLang, type Bi, type Lang } from "@/lib/i18n";
import type { Metadata } from "next";

export async function pageMeta(
  params: Promise<{ lang: string }>,
  title: Bi,
  description: Bi,
): Promise<Metadata> {
  const { lang } = await params;
  const current: Lang = isLang(lang) ? lang : "en";
  return {
    title: title[current],
    description: description[current],
  };
}

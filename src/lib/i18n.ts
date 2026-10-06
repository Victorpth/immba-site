export const langs = ["en", "zh"] as const;

export type Lang = (typeof langs)[number];

export type Bi = { en: string; zh: string };

export function isLang(value: string): value is Lang {
  return value === "en" || value === "zh";
}

export function tx(lang: Lang, copy: Bi): string {
  return copy[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === "en" ? "zh" : "en";
}

export function formatDate(lang: Lang, iso: string): string {
  const [year, month, day] = iso.split("-");
  if (lang === "zh") return `${year}/${month}/${day}`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function withLang(lang: Lang, href: string): string {
  if (href.startsWith("http")) return href;
  return `/${lang}${href.startsWith("/") ? href : `/${href}`}`;
}

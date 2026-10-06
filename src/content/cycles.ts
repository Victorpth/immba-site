import type { Bi } from "@/lib/i18n";

export type Cycle = {
  id: string;
  audience: "international" | "local";
  title: Bi;
  window: Bi;
  detail: Bi;
  href: string;
  start: string;
  end: string;
};

export const cycles: Cycle[] = [
  {
    id: "intl-spring-2027",
    audience: "international",
    title: { en: "Spring 2027 · International", zh: "2027 春季班 · 外國學生" },
    window: { en: "14 Sep – 14 Oct 2026", zh: "2026/09/14 – 10/14" },
    detail: {
      en: "English-taught entry for international students. Apply online and upload the brochure checklist.",
      zh: "外國學生全英語入學管道。請線上報名並依簡章備齊文件。",
    },
    href: "/admissions#international",
    start: "2026-09-14T00:00:00+08:00",
    end: "2026-10-14T23:59:59+08:00",
  },
  {
    id: "local-116",
    audience: "local",
    title: { en: "AY116 screening · Local", zh: "116 學年度甄試 · 本地生" },
    window: { en: "30 Sep 10:00 – 13 Oct 12:00, 2026", zh: "2026/09/30 10:00 – 10/13 12:00" },
    detail: {
      en: "No written exam. Document review and an interview, mainly in English.",
      zh: "免筆試。書面審查與口試，口試以英文為主、中文為輔。",
    },
    href: "/admissions#local",
    start: "2026-09-30T10:00:00+08:00",
    end: "2026-10-13T12:00:00+08:00",
  },
];

export function cycleState(cycle: Cycle, now = Date.now()): "upcoming" | "open" | "closed" {
  const start = new Date(cycle.start).getTime();
  const end = new Date(cycle.end).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "closed";
  return "open";
}

"use client";

import { cycleState, type Cycle } from "@/content/cycles";
import type { Lang } from "@/lib/i18n";

const label = {
  open: { en: "Open", zh: "報名中" },
  upcoming: { en: "Upcoming", zh: "即將開放" },
  closed: { en: "Closed", zh: "已截止" },
} as const;

export function CycleStatus({ cycle, lang }: { cycle: Cycle; lang: Lang }) {
  const state = cycleState(cycle);
  const tone =
    state === "open"
      ? "bg-emerald-800 text-white"
      : state === "upcoming"
        ? "bg-gold text-ink"
        : "bg-foreground/15 text-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${tone}`}>
      {label[state][lang]}
    </span>
  );
}

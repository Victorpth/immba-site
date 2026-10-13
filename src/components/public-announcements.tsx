"use client";

import { AnnouncementGrid } from "@/components/announcement-card";
import { publishedAnnouncements } from "@/content/announcements";
import { useAnnouncements } from "@/lib/announcement-store";
import { tx, type Lang } from "@/lib/i18n";

export function PublicAnnouncements({ lang }: { lang: Lang }) {
  const items = publishedAnnouncements(useAnnouncements());
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-12 text-sm text-muted-foreground">
        {tx(lang, { en: "No announcements are published yet.", zh: "目前沒有已發布的公告。" })}
      </p>
    );
  }
  return <AnnouncementGrid items={items} lang={lang} />;
}

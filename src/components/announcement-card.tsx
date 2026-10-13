import { ExternalLink, TextLink } from "@/components/site-links";
import type { Announcement } from "@/content/announcements";
import { formatDate, tx, withLang, type Lang } from "@/lib/i18n";

export function AnnouncementCard({ item, lang }: { item: Announcement; lang: Lang }) {
  const content = tx(lang, item.content);
  const external = item.linkUrl.startsWith("http");
  return (
    <article className="interactive-card flex h-full flex-col rounded-2xl border-border bg-cream p-5">
      <p className="text-xs text-muted-foreground">
        <time dateTime={item.date}>{formatDate(lang, item.date)}</time>
      </p>
      <h3 className="mt-2 text-2xl text-ink">{tx(lang, item.title)}</h3>
      {content ? <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{content}</p> : null}
      {item.linkUrl ? (
        external ? (
          <ExternalLink href={item.linkUrl} className="mt-auto pt-4 text-sm font-medium text-[#1d4f86]">
            {tx(lang, { en: "View Details", zh: "查看詳情" })}
          </ExternalLink>
        ) : (
          <TextLink href={withLang(lang, item.linkUrl)} className="mt-auto inline-flex pt-4 text-sm font-medium text-[#1d4f86]">
            {tx(lang, { en: "View Details", zh: "查看詳情" })}
          </TextLink>
        )
      ) : null}
    </article>
  );
}

export function AnnouncementGrid({ items, lang }: { items: Announcement[]; lang: Lang }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <AnnouncementCard key={item.id} item={item} lang={lang} />
      ))}
    </div>
  );
}

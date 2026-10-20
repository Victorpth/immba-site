import { ExternalLink, TextLink } from "@/components/site-links";
import type { Announcement } from "@/content/announcements";
import { formatDate, tx, withLang, type Lang } from "@/lib/i18n";

export function AnnouncementCard({ item, lang }: { item: Announcement; lang: Lang }) {
  const content = tx(lang, item.content);
  const external = item.linkUrl.startsWith("http");
  return (
    <article className="interactive-card flex w-full flex-col gap-3 rounded-2xl border-border bg-cream p-5 sm:flex-row sm:items-center sm:gap-6">
      <p className="shrink-0 text-sm text-muted-foreground sm:w-36">
        <time dateTime={item.date}>{formatDate(lang, item.date)}</time>
      </p>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-28 w-44 shrink-0 rounded-xl object-cover"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-xl text-ink">{tx(lang, item.title)}</h3>
        {content ? <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{content}</p> : null}
      </div>
      {item.linkUrl ? (
        external ? (
          <ExternalLink href={item.linkUrl} className="shrink-0 text-sm font-medium text-[#1d4f86]">
            {tx(lang, { en: "View Details", zh: "查看詳情" })}
          </ExternalLink>
        ) : (
          <TextLink href={withLang(lang, item.linkUrl)} className="shrink-0 text-sm font-medium text-[#1d4f86]">
            {tx(lang, { en: "View Details", zh: "查看詳情" })}
          </TextLink>
        )
      ) : null}
    </article>
  );
}

export function AnnouncementGrid({ items, lang }: { items: Announcement[]; lang: Lang }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map((item) => (
        <AnnouncementCard key={item.id} item={item} lang={lang} />
      ))}
    </div>
  );
}

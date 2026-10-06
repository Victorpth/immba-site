import { categoryLabel, type NewsItem } from "@/content/news";
import { formatDate, tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";

const tone: Record<NewsItem["category"], string> = {
  admissions: "bg-burgundy",
  courses: "bg-ink",
  partnerships: "bg-[#1e3d34]",
  campus: "bg-[#6a4a32]",
  careers: "bg-[#1d3557]",
};

export function NewsCard({ item, lang, featured = false }: { item: NewsItem; lang: Lang; featured?: boolean }) {
  return (
    <Link
      href={withLang(lang, `/news/${item.slug}`)}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-cream ${featured ? "sm:flex-row" : ""}`}
    >
      <div className={`${tone[item.category]} ${featured ? "sm:w-2/5" : ""} relative min-h-36 p-5 text-cream`}>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase opacity-80">
          {tx(lang, categoryLabel[item.category])}
        </p>
        <p className="font-display absolute right-4 bottom-3 text-5xl text-white/25">
          {item.date.slice(5, 7)}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-muted-foreground">
          {formatDate(lang, item.date)}
          {item.pinned ? ` · ${tx(lang, { en: "Pinned", zh: "置頂" })}` : ""}
        </p>
        <h2 className="mt-2 text-2xl leading-snug text-ink group-hover:text-burgundy">{tx(lang, item.title)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tx(lang, item.summary)}</p>
      </div>
    </Link>
  );
}

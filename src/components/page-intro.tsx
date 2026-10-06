import type { Lang } from "@/lib/i18n";
import { tx, type Bi } from "@/lib/i18n";

export function PageIntro({
  lang,
  eyebrow,
  title,
  lede,
}: {
  lang: Lang;
  eyebrow: Bi;
  title: Bi;
  lede: Bi;
}) {
  return (
    <header className="border-b border-border bg-cream">
      <div className="site-wrap py-14 sm:py-20">
        <p className="text-xs font-semibold tracking-[0.22em] text-burgundy uppercase">
          {tx(lang, eyebrow)}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-[1.15] text-ink sm:text-5xl">
          {tx(lang, title)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {tx(lang, lede)}
        </p>
      </div>
    </header>
  );
}

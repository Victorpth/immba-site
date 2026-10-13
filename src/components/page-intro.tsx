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
      <div className="site-wrap py-10 sm:py-14">
        <p className="text-sm font-semibold text-burgundy uppercase">
          {tx(lang, eyebrow)}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl text-ink sm:text-5xl">
          {tx(lang, title)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#243044]">
          {tx(lang, lede)}
        </p>
      </div>
    </header>
  );
}

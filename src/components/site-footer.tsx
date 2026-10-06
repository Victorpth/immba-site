import { LogoMark } from "@/components/logo-mark";
import { navGroups, utilityLinks } from "@/content/nav";
import { tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";

export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-auto bg-ink text-cream">
      <div className="site-wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href={withLang(lang, "/")} className="flex items-center gap-3">
            <LogoMark className="size-12 text-cream" />
            <p className="font-display text-3xl leading-none">imMBA</p>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/70">
            {tx(lang, {
              en: "MBA in International Management, College of Management, Fu Jen Catholic University.",
              zh: "輔仁大學管理學院國際經營管理碩士班。",
            })}
          </p>
          <address className="mt-5 text-sm leading-relaxed text-cream/80 not-italic">
            {tx(lang, {
              en: "LM208-1, No. 510, Zhongzheng Rd., Xinzhuang Dist., New Taipei City 242062, Taiwan",
              zh: "242062 新北市新莊區中正路 510 號 LM208-1",
            })}
            <br />
            <a className="underline decoration-white/30 underline-offset-4" href="tel:+886229052750">
              +886 2 2905 2750
            </a>
            <br />
            <a className="underline decoration-white/30 underline-offset-4" href="mailto:imMBA@mail.fju.edu.tw">
              imMBA@mail.fju.edu.tw
            </a>
          </address>
        </div>
        {navGroups.slice(0, 2).map((group) => (
          <div key={group.href}>
            <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
              {tx(lang, group.label)}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={withLang(lang, link.href)} className="hover:text-cream">
                    {tx(lang, link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-gold uppercase">
            {tx(lang, { en: "More", zh: "更多" })}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-cream/80">
            {[...navGroups[2].links, ...navGroups[3].links, ...utilityLinks].map((link) => (
              <li key={link.href}>
                <Link href={withLang(lang, link.href)} className="hover:text-cream">
                  {tx(lang, link.label)}
                </Link>
              </li>
            ))}
            <li>
              <a className="hover:text-cream" href="https://www.management.fju.edu.tw/">
                {tx(lang, { en: "College of Management", zh: "輔大管理學院" })}
              </a>
            </li>
            <li>
              <a className="hover:text-cream" href="https://www.fju.edu.tw/">
                {tx(lang, { en: "Fu Jen Catholic University", zh: "輔仁大學" })}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="site-wrap flex flex-col gap-2 py-5 text-xs leading-relaxed text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} College of Management, Fu Jen Catholic University</p>
          <p>
            {tx(lang, {
              en: "Confirm deadlines and fees with the imMBA office before you apply.",
              zh: "報名前請向國際經管辦公室確認期限與費用。",
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}

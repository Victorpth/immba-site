"use client";

import { primaryMenu } from "@/content/nav";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo-mark";
import { otherLang, tx, withLang, type Lang } from "@/lib/i18n";
import { ChevronDown, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const openedByHover = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setOpenMenu(null);
  }, [pathname]);

  function switchedPath(next: Lang) {
    const parts = pathname.split("/");
    if (parts[1] === "en" || parts[1] === "zh") parts[1] = next;
    return parts.join("/") || `/${next}`;
  }

  function onSwitchLanguage(event: { preventDefault: () => void }, next: Lang) {
    const search = window.location.search;
    if (!search) return;
    event.preventDefault();
    router.push(`${switchedPath(next)}${search}`);
  }

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(withLang(lang, `/search${value ? `?q=${encodeURIComponent(value)}` : ""}`));
  }

  const apply = withLang(lang, "/admissions");
  const contact = withLang(lang, "/contact");
  const official = {
    en: "https://www.management.fju.edu.tw/esubweb/immbaengindex/",
    zh: "https://www.management.fju.edu.tw/subweb/immba/",
  }[lang];

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#f6d4dc] text-[#6e243c]">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5 text-sm leading-snug">
          <p className="min-w-0 leading-relaxed">
            {tx(lang, {
              en: "Course teaching demonstration site by Victor Pothet (not the official website)",
              zh: "Victor Pothet 課程教學示範網站（非正式官方網站）",
            })}
            <span className="px-1.5 text-[#6e243c]/45" aria-hidden>
              |
            </span>
            <a
              href={official}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline decoration-[#6e243c]/35 underline-offset-4 hover:decoration-[#6e243c]"
            >
              {tx(lang, { en: "Official imMBA website", zh: "國際經管官方網站" })}
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </p>
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="shrink-0 rounded-full border border-[#6e243c]/40 bg-white/70 px-3 py-1.5 text-sm font-semibold hover:bg-white"
          >
            {menuOpen
              ? tx(lang, { en: "Collapse main menu", zh: "收合主選單" })
              : tx(lang, { en: "Open main menu", zh: "展開主選單" })}
          </button>
        </div>
      </div>

      <div className="border-b border-[#d5e2ef] bg-[#eef3f8]">
        <div className="site-wrap flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={withLang(lang, "/admin/news")}
              aria-label={tx(lang, { en: "Open AdminNews", zh: "開啟公告管理" })}
              className="shrink-0 rounded-full"
            >
              <LogoMark className="size-16 object-contain sm:size-[4.5rem]" tone="light" />
            </Link>
            <Link href={withLang(lang, "/")} className="min-w-0 rounded-sm">
              <span className="block font-display text-2xl leading-tight text-ink">
                {tx(lang, {
                  en: "Fu Jen Catholic University",
                  zh: "輔仁大學",
                })}
              </span>
              <span className="mt-0.5 block text-base text-[#243044]">
                {tx(lang, {
                  en: "International MBA (imMBA)",
                  zh: "國際經營管理碩士班 (imMBA)",
                })}
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <form onSubmit={onSearch} className="w-full sm:w-48">
              <label className="relative block">
                <span className="sr-only">{tx(lang, { en: "Search", zh: "搜尋" })}</span>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#3d4d63]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={tx(lang, { en: "Search", zh: "搜尋" })}
                  className="h-11 w-full rounded-full border border-[#c5d4e4] bg-white pr-3 pl-9 text-base text-ink outline-none placeholder:text-[#3e4854] focus:border-burgundy"
                />
              </label>
            </form>
            <Link
              href={switchedPath(otherLang(lang))}
              hrefLang={otherLang(lang) === "zh" ? "zh-Hant" : "en"}
              onClick={(event) => onSwitchLanguage(event, otherLang(lang))}
              className="inline-flex h-11 items-center rounded-full border border-[#c5d4e4] bg-white px-3 text-sm font-semibold text-ink hover:bg-[#f4f7fb]"
            >
              {lang === "en" ? "中文" : "EN"}
            </Link>
            <Button nativeButton={false} variant="outline" render={<Link href={contact} />} className="h-11 bg-white px-4">
              {tx(lang, { en: "Contact Us", zh: "聯絡我們" })}
            </Button>
            <Button nativeButton={false} render={<Link href={apply} />} className="h-11 px-4">
              {tx(lang, { en: "Apply Now", zh: "立即報名" })}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-white">
        <div className="site-wrap py-2">
          <div className="min-w-0">
            {menuOpen ? (
              <nav aria-label={tx(lang, { en: "Main", zh: "主選單" })} className="flex flex-wrap gap-1">
                {primaryMenu.map((item) => {
                  const href = withLang(lang, item.href);
                  const children = item.children ?? [];
                  const childActive = (childHref: string) =>
                    pathname === childHref || pathname.startsWith(`${childHref}/`);
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`) || children.some((child) => childActive(withLang(lang, child.href)));
                  const shown = openMenu === item.href;
                  const itemClass = `inline-flex min-h-11 items-center gap-1 rounded-lg px-2.5 py-2 text-[15px] ${
                    shown || active
                      ? "bg-[#e7f0f8] font-semibold text-[#1d4f86]"
                      : "text-ink hover:bg-[#f4f7fb] hover:text-[#1d4f86]"
                  }`;
                  return (
                    <div
                      key={item.href}
                      className={`relative ${shown ? "z-50" : ""}`}
                      onMouseEnter={() => {
                        if (children.length > 0) {
                          openedByHover.current = item.href;
                          setOpenMenu(item.href);
                        }
                      }}
                      onMouseLeave={() => {
                        if (openedByHover.current === item.href) openedByHover.current = null;
                        setOpenMenu((current) => (current === item.href ? null : current));
                      }}
                    >
                      {children.length > 0 ? (
                        <button
                          type="button"
                          aria-expanded={shown}
                          aria-haspopup="true"
                          onClick={() => {
                            if (openedByHover.current === item.href) {
                              openedByHover.current = null;
                              setOpenMenu(item.href);
                              return;
                            }
                            setOpenMenu((current) => (current === item.href ? null : item.href));
                          }}
                          className={itemClass}
                        >
                          {tx(lang, item.label)}
                          <ChevronDown className={`size-3.5 transition ${shown ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>
                      ) : (
                        <Link href={href} aria-current={active ? "page" : undefined} className={itemClass}>
                          {tx(lang, item.label)}
                        </Link>
                      )}
                      {children.length > 0 && shown ? (
                        <div className="absolute top-full left-0 z-50 min-w-56 border border-[#c5d0dc] bg-white py-1 shadow-md">
                          {children.map((child) => {
                            const childHref = withLang(lang, child.href);
                            const current = childActive(childHref);
                            return (
                              <Link
                                key={child.href}
                                href={childHref}
                                aria-current={current ? "page" : undefined}
                                className={`block px-3 py-2.5 text-[15px] leading-snug ${
                                  current
                                    ? "bg-[#f4f8fc] font-medium text-[#1d4f86]"
                                    : "text-ink hover:bg-[#f4f8fc] hover:text-[#1d4f86]"
                                }`}
                              >
                                {tx(lang, child.label)}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
            ) : null}
            <p className={`${menuOpen ? "mt-2" : ""} text-sm text-[#3e4854]`}>
              <a
                className="inline-flex items-center gap-1 hover:text-ink"
                href="https://www.management.fju.edu.tw/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {tx(lang, { en: "College of Management", zh: "管理學院" })}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

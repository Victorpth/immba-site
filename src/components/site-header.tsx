"use client";

import { primaryMenu } from "@/content/nav";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo-mark";
import { otherLang, tx, withLang, type Lang } from "@/lib/i18n";
import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
  const official = {
    en: "https://www.management.fju.edu.tw/esubweb/immbaengindex/",
    zh: "https://www.management.fju.edu.tw/subweb/immba/",
  }[lang];

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#f6d4dc] text-[#6e243c]">
        <div className="site-wrap flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 text-xs sm:text-[13px]">
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
            className="shrink-0 rounded-full border border-[#6e243c]/30 bg-white/40 px-3 py-1 text-xs font-semibold hover:bg-white/70"
          >
            {menuOpen
              ? tx(lang, { en: "Collapse main menu", zh: "收合主選單" })
              : tx(lang, { en: "Open main menu", zh: "展開主選單" })}
          </button>
        </div>
      </div>

      <div className="border-b border-[#d5e2ef] bg-[#eef3f8]">
        <div className="site-wrap flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
          <Link href={withLang(lang, "/")} className="flex min-w-0 items-center gap-3 sm:gap-4">
            <LogoMark className="size-24 shrink-0 object-contain sm:size-28" tone="light" />
            <span className="min-w-0">
              <span className="block font-display text-xl leading-tight text-ink sm:text-2xl">
                {tx(lang, {
                  en: "Fu Jen Catholic University",
                  zh: "輔仁大學",
                })}
              </span>
              <span className="mt-0.5 block text-sm text-[#3d4d63] sm:text-base">
                {tx(lang, {
                  en: "International MBA (imMBA)",
                  zh: "國際經營管理碩士班 (imMBA)",
                })}
              </span>
            </span>
          </Link>
          <form onSubmit={onSearch} className="sm:ml-auto sm:w-56">
            <label className="relative block">
              <span className="sr-only">{tx(lang, { en: "Search", zh: "搜尋" })}</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#3d4d63]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tx(lang, { en: "Search", zh: "搜尋" })}
                className="h-10 w-full rounded-full border border-[#c5d4e4] bg-white pr-3 pl-9 text-sm text-ink outline-none placeholder:text-[#7b8ba0] focus:border-burgundy"
              />
            </label>
          </form>
        </div>
      </div>

      <div className="border-b border-border bg-white">
        <div className="site-wrap flex flex-col gap-3 py-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            {menuOpen ? (
              <nav aria-label={tx(lang, { en: "Main", zh: "主選單" })} className="flex flex-wrap items-stretch">
                {primaryMenu.map((item, index) => {
                  const href = withLang(lang, item.href);
                  const children = item.children ?? [];
                  const active =
                    pathname === href ||
                    pathname.startsWith(`${href}/`) ||
                    children.some((child) => {
                      const childHref = withLang(lang, child.href);
                      return pathname === childHref || pathname.startsWith(`${childHref}/`);
                    });
                  const shown = openMenu === item.href;
                  const itemClass = `inline-flex items-center px-3 py-2 text-sm ${
                    index > 0 ? "border-l border-[#d5dde6]" : ""
                  } ${
                    shown || active
                      ? "border border-[#7aa2c4] bg-[#f4f8fc] font-medium text-[#1d4f86]"
                      : "text-ink hover:text-[#1d4f86]"
                  }`;
                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => {
                        if (children.length > 0) setOpenMenu(item.href);
                      }}
                      onMouseLeave={() => {
                        setOpenMenu((current) => (current === item.href ? null : current));
                      }}
                    >
                      {children.length > 0 ? (
                        <button
                          type="button"
                          aria-expanded={shown}
                          aria-haspopup="true"
                          onClick={() => setOpenMenu((current) => (current === item.href ? null : item.href))}
                          className={itemClass}
                        >
                          {tx(lang, item.label)}
                        </button>
                      ) : (
                        <Link href={href} aria-current={active ? "page" : undefined} className={itemClass}>
                          {tx(lang, item.label)}
                        </Link>
                      )}
                      {children.length > 0 && shown ? (
                        <div className="absolute top-full left-0 z-50 min-w-56 border border-[#c5d0dc] bg-white p-2 shadow-md">
                          {children.map((child) => (
                            <Link
                              key={child.href}
                              href={withLang(lang, child.href)}
                              className="mt-1 block border border-[#d7dee6] px-3 py-2 text-sm text-ink first:mt-0 hover:border-[#7aa2c4] hover:text-[#1d4f86]"
                            >
                              {tx(lang, child.label)}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </nav>
            ) : null}
            <p className={`${menuOpen ? "mt-2" : ""} text-xs text-muted-foreground`}>
              <a className="hover:text-ink" href="https://www.management.fju.edu.tw/">
                {tx(lang, { en: "College of Management", zh: "管理學院" })}
              </a>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={switchedPath(otherLang(lang))}
              hrefLang={otherLang(lang) === "zh" ? "zh-Hant" : "en"}
              onClick={(event) => onSwitchLanguage(event, otherLang(lang))}
              className="inline-flex h-9 items-center rounded-full border border-border px-3 text-xs font-semibold text-ink hover:bg-muted"
            >
              {lang === "en" ? "中文" : "EN"}
            </Link>
            <Button nativeButton={false} render={<Link href={apply} />} className="h-9 px-4">
              {tx(lang, { en: "Apply Now", zh: "立即報名" })}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

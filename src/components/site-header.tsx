"use client";

import { navGroups, utilityLinks } from "@/content/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { otherLang, tx, withLang, type Lang } from "@/lib/i18n";
import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export function SiteHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
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
    setOpen(false);
  }

  const apply = withLang(lang, "/admissions");

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink text-cream">
      <div className="site-wrap flex h-9 items-center justify-between gap-4 text-[11px] tracking-[0.14em] text-cream/70 uppercase">
        <p className="truncate">
          {tx(lang, {
            en: "Fu Jen Catholic University · College of Management",
            zh: "輔仁大學 · 管理學院",
          })}
        </p>
        <p className="hidden shrink-0 sm:block">AACSB Accredited</p>
      </div>
      <div className="border-t border-white/10">
        <div className="site-wrap flex h-16 items-center gap-4">
          <Link href={withLang(lang, "/")} className="mr-auto flex items-baseline gap-3">
            <span className="font-display text-2xl tracking-tight text-cream">imMBA</span>
            <span className="hidden text-xs leading-tight text-cream/70 lg:block">
              {tx(lang, {
                en: "MBA in International Management",
                zh: "國際經營管理碩士班",
              })}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navGroups.map((group) => (
              <div key={group.href} className="group relative">
                <Link
                  href={withLang(lang, group.href)}
                  className="rounded-md px-3 py-2 text-sm text-cream/85 hover:bg-white/10 hover:text-cream"
                >
                  {tx(lang, group.label)}
                </Link>
                <div className="invisible absolute top-full left-0 z-20 w-80 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="rounded-xl border border-border bg-cream p-2 text-foreground shadow-xl">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={withLang(lang, link.href)}
                        className="block rounded-lg px-3 py-2.5 hover:bg-muted"
                      >
                        <span className="block text-sm font-medium">{tx(lang, link.label)}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                          {tx(lang, link.description)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Link
              href={withLang(lang, "/news")}
              className="rounded-md px-3 py-2 text-sm text-cream/85 hover:bg-white/10 hover:text-cream"
            >
              {tx(lang, { en: "News", zh: "公告" })}
            </Link>
          </nav>

          <form onSubmit={onSearch} className="hidden items-center md:flex">
            <label className="relative">
              <span className="sr-only">{tx(lang, { en: "Search", zh: "搜尋" })}</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-cream/50" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tx(lang, { en: "Search", zh: "搜尋" })}
                className="h-9 w-36 rounded-full border border-white/15 bg-white/5 pr-3 pl-8 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-gold focus:w-48"
              />
            </label>
          </form>

          <Link
            href={switchedPath(otherLang(lang))}
            hrefLang={otherLang(lang) === "zh" ? "zh-Hant" : "en"}
            onClick={(event) => onSwitchLanguage(event, otherLang(lang))}
            className="hidden rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold tracking-wide text-cream hover:bg-white/10 sm:inline-flex"
          >
            {lang === "en" ? "中文" : "EN"}
          </Link>

          <Button
            nativeButton={false}
            render={<Link href={apply} />}
            className="hidden h-9 px-4 sm:inline-flex"
          >
            {tx(lang, { en: "Apply", zh: "報名" })}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="text-cream hover:bg-white/10 lg:hidden" />}
            >
              <Menu />
              <span className="sr-only">{tx(lang, { en: "Menu", zh: "選單" })}</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,22rem)] bg-cream">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">imMBA</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-8">
                <form onSubmit={onSearch}>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tx(lang, { en: "Search the program", zh: "搜尋本班資訊" })}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                  />
                </form>
                {navGroups.map((group) => (
                  <div key={group.href}>
                    <p className="text-xs font-semibold tracking-[0.16em] text-burgundy uppercase">
                      {tx(lang, group.label)}
                    </p>
                    <div className="mt-2 flex flex-col">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={withLang(lang, link.href)}
                          onClick={() => setOpen(false)}
                          className="py-1.5 text-sm"
                        >
                          {tx(lang, link.label)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  {utilityLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={withLang(lang, link.href)}
                      onClick={() => setOpen(false)}
                      className="text-sm"
                    >
                      {tx(lang, link.label)}
                    </Link>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={switchedPath(otherLang(lang))}
                    onClick={(event) => {
                      onSwitchLanguage(event, otherLang(lang));
                      setOpen(false);
                    }}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border text-sm"
                  >
                    {lang === "en" ? "中文" : "English"}
                  </Link>
                  <Link
                    href={apply}
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground"
                  >
                    {tx(lang, { en: "Apply", zh: "報名" })}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

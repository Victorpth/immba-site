"use client";

import { tx, withLang, type Lang } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const items = [
    { href: withLang(lang, "/admin/news"), label: { en: "Announcements", zh: "公告" } },
    { href: withLang(lang, "/admin/faculty"), label: { en: "Faculty", zh: "師資" } },
  ];

  return (
    <nav aria-label={tx(lang, { en: "Back office", zh: "後台" })} className="border-b border-border bg-[#f7f4ee]">
      <div className="site-wrap flex flex-wrap gap-2 py-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold ${
                active ? "bg-primary text-primary-foreground" : "bg-white text-ink hover:border-burgundy border border-border"
              }`}
            >
              {tx(lang, item.label)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

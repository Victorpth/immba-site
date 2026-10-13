import { tx, type Lang } from "@/lib/i18n";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function fileKind(href: string): "PDF" | "DOC" | "XLS" | null {
  const path = href.split("?")[0].split("#")[0].toLowerCase();
  if (path.endsWith(".pdf")) return "PDF";
  if (path.endsWith(".doc") || path.endsWith(".docx")) return "DOC";
  if (path.endsWith(".xls") || path.endsWith(".xlsx")) return "XLS";
  return null;
}

function ExternalIcon() {
  return <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />;
}

export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 underline decoration-current/35 underline-offset-4 hover:decoration-current ${className}`}
    >
      {children}
      <ExternalIcon />
    </a>
  );
}

/** A file on or off this site. The label always names the file type. */
export function ResourceLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const kind = fileKind(href);
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center gap-1 text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86] hover:decoration-[#1d4f86] ${className}`}
    >
      <span>
        {children}
        {kind ? ` (${kind})` : ""}
      </span>
      {external ? <ExternalIcon /> : null}
    </a>
  );
}

/** Apply, register, contact, and other primary actions. */
export function ActionLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const external = href.startsWith("http");
  const classes = `inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85 ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        <ExternalIcon />
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`text-ink underline decoration-[#c5d0dc] underline-offset-4 hover:text-[#1d4f86] hover:decoration-[#1d4f86] ${className}`}
    >
      {children}
    </Link>
  );
}

export function AnnouncementSource({ lang }: { lang: Lang }) {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      {tx(lang, { en: "Source:", zh: "資料來源：" })}{" "}
      <ExternalLink href="https://www.management.fju.edu.tw/subweb/immba/news.php">
        {tx(lang, {
          en: "Fu Jen imMBA announcements",
          zh: "輔仁大學國際經營管理碩士班公告",
        })}
      </ExternalLink>
    </p>
  );
}

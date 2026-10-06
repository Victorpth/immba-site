import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-wrap py-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-burgundy uppercase">404</p>
      <h1 className="mt-3 max-w-xl text-4xl text-ink">This page is not part of the imMBA site.</h1>
      <p className="mt-3 text-muted-foreground">找不到這個頁面。請從首頁重新開始。</p>
      <div className="mt-6 flex gap-3">
        <Link href="/en" className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
          English home
        </Link>
        <Link href="/zh" className="rounded-lg border border-border px-4 py-2 text-sm">
          中文首頁
        </Link>
      </div>
    </div>
  );
}

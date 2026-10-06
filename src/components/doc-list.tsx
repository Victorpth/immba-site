import { docsFor, type DocGroup } from "@/content/documents";
import { tx, type Lang } from "@/lib/i18n";

export function DocList({ lang, group }: { lang: Lang; group?: DocGroup }) {
  const items = docsFor(lang, group);
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">
        {tx(lang, { en: "No files in this group yet.", zh: "這個分類目前沒有檔案。" })}
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-cream">
      {items.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.href}
            className="flex flex-col gap-2 px-5 py-4 transition hover:bg-muted/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <span className="block font-medium text-ink">{tx(lang, doc.title)}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{tx(lang, doc.note)}</span>
            </span>
            <span className="w-fit rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold tracking-wide text-burgundy">
              {doc.kind}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

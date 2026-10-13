import { ResourceLink, ExternalLink } from "@/components/site-links";
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
      {items.map((doc) => {
        const title = tx(lang, doc.title);
        const note = tx(lang, doc.note);
        return (
          <li key={doc.id} className="px-5 py-4">
            {doc.kind === "Web" ? (
              <ExternalLink href={doc.href} className="font-medium text-ink">
                {title}
              </ExternalLink>
            ) : (
              <ResourceLink href={doc.href} className="font-medium">
                {title}
              </ResourceLink>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{note}</p>
          </li>
        );
      })}
    </ul>
  );
}

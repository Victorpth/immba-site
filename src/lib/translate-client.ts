import type { Lang } from "@/lib/i18n";

export async function translateTexts(texts: string[], from: Lang, to: Lang) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, from, to }),
  });
  if (!response.ok) throw new Error("Translation unavailable");
  const data = (await response.json()) as { texts?: unknown };
  if (!Array.isArray(data.texts)) throw new Error("Translation unavailable");
  return data.texts.map((item) => (typeof item === "string" ? item : ""));
}

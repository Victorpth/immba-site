import { isLang, type Lang } from "@/lib/i18n";

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function chunks(text: string, size: number) {
  const parts: string[] = [];
  for (let index = 0; index < text.length; index += size) parts.push(text.slice(index, index + size));
  return parts;
}

async function translateChunk(text: string, from: Lang, to: Lang) {
  const pair = `${from === "zh" ? "zh-TW" : "en"}|${to === "zh" ? "zh-TW" : "en"}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Translation unavailable");
  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  const translated = data.responseData?.translatedText ?? "";
  if (!translated || data.responseStatus !== 200 || /MYMEMORY WARNING/i.test(translated)) {
    throw new Error("Translation unavailable");
  }
  return decodeEntities(translated);
}

async function translateText(text: string, from: Lang, to: Lang) {
  const parts = chunks(text, 120);
  const translated: string[] = [];
  for (const part of parts) translated.push(await translateChunk(part, from, to));
  return translated.join("");
}

export async function POST(request: Request) {
  let body: { texts?: unknown; from?: unknown; to?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const from = typeof body.from === "string" && isLang(body.from) ? body.from : null;
  const to = typeof body.to === "string" && isLang(body.to) ? body.to : null;
  if (!from || !to || from === to || !Array.isArray(body.texts)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const texts = body.texts.slice(0, 4).map((item) => (typeof item === "string" ? item.slice(0, 2000) : ""));
  try {
    const translated: string[] = [];
    for (const text of texts) {
      translated.push(text.trim() ? await translateText(text, from, to) : "");
    }
    return Response.json({ texts: translated });
  } catch {
    return Response.json({ error: "Translation unavailable" }, { status: 502 });
  }
}

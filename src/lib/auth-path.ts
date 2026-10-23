import { isLang, type Lang } from "@/lib/i18n";

const internalPath = /^\/(en|zh)\/[A-Za-z0-9/_-]*$/;

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !internalPath.test(value) || value.includes("//")) return null;
  return value;
}

export function formLang(value: FormDataEntryValue | null): Lang {
  return typeof value === "string" && isLang(value) ? value : "en";
}

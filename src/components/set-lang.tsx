"use client";

import { useEffect } from "react";

export function SetLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);
  return null;
}

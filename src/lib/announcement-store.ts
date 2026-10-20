"use client";

import { announcements, type Announcement } from "@/content/announcements";
import { useEffect, useState } from "react";

const STORAGE_KEY = "immba-admin-news";

function cloneSeed(): Announcement[] {
  return announcements.map((item) => ({
    ...item,
    title: { ...item.title },
    content: { ...item.content },
    imageUrl: item.imageUrl ?? "",
    sync: item.sync ? { ...item.sync } : null,
  }));
}

function isAnnouncement(value: unknown): value is Announcement {
  if (!value || typeof value !== "object") return false;
  const item = value as Announcement;
  return (
    typeof item.id === "string" &&
    typeof item.date === "string" &&
    typeof item.linkUrl === "string" &&
    typeof item.order === "number" &&
    (item.status === "published" || item.status === "draft") &&
    !!item.title &&
    typeof item.title.en === "string" &&
    typeof item.title.zh === "string" &&
    !!item.content &&
    typeof item.content.en === "string" &&
    typeof item.content.zh === "string" &&
    (item.imageUrl === undefined || typeof item.imageUrl === "string")
  );
}

function sameText(a: Announcement, b: Announcement) {
  return a.title.en.trim() === b.title.en.trim() && a.title.zh.trim() === b.title.zh.trim();
}

export function readAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isAnnouncement)) return cloneSeed();
    const stored = parsed;
    const missing = cloneSeed().filter(
      (item) => !stored.some((current) => current.id === item.id || sameText(current, item)),
    );
    return [...stored, ...missing];
  } catch {
    return cloneSeed();
  }
}

const listeners = new Set<() => void>();

export function writeAnnouncements(items: Announcement[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
}

export function subscribeAnnouncements(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAnnouncements() {
  const [items, setItems] = useState<Announcement[]>(cloneSeed);
  useEffect(() => {
    setItems(readAnnouncements());
    return subscribeAnnouncements(() => setItems(readAnnouncements()));
  }, []);
  return items;
}

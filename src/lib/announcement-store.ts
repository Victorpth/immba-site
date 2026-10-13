"use client";

import { announcements, type Announcement } from "@/content/announcements";
import { useEffect, useState } from "react";

const STORAGE_KEY = "immba-admin-news";

function cloneSeed(): Announcement[] {
  return announcements.map((item) => ({
    ...item,
    title: { ...item.title },
    content: { ...item.content },
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
    typeof item.content.zh === "string"
  );
}

export function readAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isAnnouncement)) return cloneSeed();
    return parsed;
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

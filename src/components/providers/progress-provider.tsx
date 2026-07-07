"use client";

/**
 * Client-side persistence for checklist progress, bookmarks, and recently
 * viewed pages. Backed by localStorage so an employee's progress survives
 * reloads without any server. SSR-safe: state starts empty and hydrates in an
 * effect, exposing `hydrated` so consumers can avoid flicker / mismatch.
 */
import * as React from "react";

const KEYS = {
  completed: "onboarding.completed.v1",
  bookmarks: "onboarding.bookmarks.v1",
  recent: "onboarding.recent.v1",
} as const;

export interface RecentItem {
  href: string;
  title: string;
  ts: number;
}

interface ProgressState {
  hydrated: boolean;
  completed: Set<string>;
  bookmarks: Set<string>;
  recent: RecentItem[];
  toggleStep: (id: string) => void;
  setStep: (id: string, done: boolean) => void;
  isComplete: (id: string) => boolean;
  completeMany: (ids: string[], done: boolean) => void;
  resetSection: (ids: string[]) => void;
  resetAll: () => void;
  toggleBookmark: (href: string) => void;
  isBookmarked: (href: string) => boolean;
  pushRecent: (item: Omit<RecentItem, "ts">) => void;
}

const ProgressContext = React.createContext<ProgressState | null>(null);

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function readRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEYS.recent);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

const MAX_RECENT = 8;

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = React.useState<Set<string>>(new Set());
  const [recent, setRecent] = React.useState<RecentItem[]>([]);

  // Hydrate once on mount.
  React.useEffect(() => {
    setCompleted(readSet(KEYS.completed));
    setBookmarks(readSet(KEYS.bookmarks));
    setRecent(readRecent());
    setHydrated(true);
  }, []);

  // Persist on change (after hydration only).
  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEYS.completed, JSON.stringify([...completed]));
  }, [completed, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEYS.bookmarks, JSON.stringify([...bookmarks]));
  }, [bookmarks, hydrated]);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEYS.recent, JSON.stringify(recent));
  }, [recent, hydrated]);

  // Sync across tabs.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEYS.completed) setCompleted(readSet(KEYS.completed));
      if (e.key === KEYS.bookmarks) setBookmarks(readSet(KEYS.bookmarks));
      if (e.key === KEYS.recent) setRecent(readRecent());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = React.useMemo<ProgressState>(() => {
    const mutate = (fn: (next: Set<string>) => void) =>
      setCompleted((prev) => {
        const next = new Set(prev);
        fn(next);
        return next;
      });

    return {
      hydrated,
      completed,
      bookmarks,
      recent,
      toggleStep: (id) =>
        mutate((next) => (next.has(id) ? next.delete(id) : next.add(id))),
      setStep: (id, done) => mutate((next) => (done ? next.add(id) : next.delete(id))),
      isComplete: (id) => completed.has(id),
      completeMany: (ids, done) =>
        mutate((next) => ids.forEach((id) => (done ? next.add(id) : next.delete(id)))),
      resetSection: (ids) => mutate((next) => ids.forEach((id) => next.delete(id))),
      resetAll: () => setCompleted(new Set()),
      toggleBookmark: (href) =>
        setBookmarks((prev) => {
          const next = new Set(prev);
          if (next.has(href)) next.delete(href);
          else next.add(href);
          return next;
        }),
      isBookmarked: (href) => bookmarks.has(href),
      pushRecent: (item) =>
        setRecent((prev) => {
          const filtered = prev.filter((r) => r.href !== item.href);
          return [{ ...item, ts: Date.now() }, ...filtered].slice(0, MAX_RECENT);
        }),
    };
  }, [hydrated, completed, bookmarks, recent]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressState {
  const ctx = React.useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within <ProgressProvider>");
  return ctx;
}

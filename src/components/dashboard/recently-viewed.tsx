"use client";

import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";

import { useProgress } from "@/components/providers/progress-provider";

export function RecentlyViewed() {
  const { recent, hydrated } = useProgress();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Clock className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Recently viewed</h3>
      </div>
      <div className="p-2">
        {!hydrated ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Pages you open will show up here.
          </p>
        ) : (
          <ul>
            {recent.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1 truncate text-foreground/90">{r.title}</span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { useProgress } from "@/components/providers/progress-provider";
import { getIcon } from "@/lib/icons";
import { StatusBadge, TimePill } from "@/components/content-badges";
import { cn } from "@/lib/utils";

export function WorkflowList() {
  const { sections } = useCatalog();
  const { completed, hydrated } = useProgress();

  return (
    <ol className="relative">
      {/* connecting line */}
      <span
        aria-hidden
        className="absolute left-[27px] top-6 bottom-6 w-px bg-border sm:left-[31px]"
      />
      {sections.map((s, i) => {
        const href = `/sections/${s.slug}`;
        const Icon = getIcon(s.icon);
        const done = s.steps.filter((st) => completed.has(st.id)).length;
        const total = s.steps.length;
        const pct = total ? Math.round((done / total) * 100) : 0;
        const allDone = hydrated && done === total && total > 0;
        const started = hydrated && done > 0 && !allDone;

        return (
          <li key={s.slug} className="relative">
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/60 sm:gap-4 sm:p-3"
            >
              <span
                className={cn(
                  "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors sm:size-12",
                  allDone
                    ? "border-[var(--success)] bg-[var(--success)] text-[var(--success-foreground)]"
                    : started
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-foreground",
                )}
              >
                {allDone ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {s.phase ?? `Step ${i + 1}`}
                  </span>
                  <StatusBadge badge={s.badge} />
                  {hydrated && (started || allDone) && (
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {done}/{total}
                    </span>
                  )}
                </div>
                <h3 className="mt-0.5 truncate text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">
                  {s.summary}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 max-w-[180px] flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-500",
                        allDone ? "bg-[var(--success)]" : "bg-primary",
                      )}
                      style={{ width: `${hydrated ? pct : 0}%` }}
                    />
                  </div>
                  <TimePill time={s.estimatedTime} />
                </div>
              </div>

              <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

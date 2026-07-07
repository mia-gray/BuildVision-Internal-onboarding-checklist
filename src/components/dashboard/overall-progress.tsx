"use client";

import * as React from "react";
import { RotateCcw, Layers, ListChecks, ShieldCheck } from "lucide-react";

import { usePlaybookStats } from "@/lib/use-stats";
import { useProgress } from "@/components/providers/progress-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Ring({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-secondary)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={percent === 100 ? "var(--success)" : "var(--color-primary)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Layers;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="leading-tight">
        <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export function OverallProgress() {
  const stats = usePlaybookStats();
  const { hydrated, resetAll } = useProgress();
  const [confirming, setConfirming] = React.useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Ring percent={hydrated ? stats.percent : 0} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold">Overall progress</h2>
              <p className="text-sm text-muted-foreground">
                {hydrated ? (
                  <>
                    {stats.doneSteps} of {stats.totalSteps} steps complete · {stats.doneSections}/
                    {stats.totalSections} sections done
                  </>
                ) : (
                  "Loading your saved progress…"
                )}
              </p>
            </div>
            {hydrated && stats.doneSteps > 0 && (
              <div className="shrink-0">
                {confirming ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        resetAll();
                        setConfirming(false);
                      }}
                    >
                      Reset all
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => setConfirming(true)}
                  >
                    <RotateCcw className="size-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>

          <div
            className={cn(
              "mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3",
              !hydrated && "opacity-50",
            )}
          >
            <Stat icon={ListChecks} value={`${stats.doneSteps}/${stats.totalSteps}`} label="Tasks done" />
            <Stat
              icon={Layers}
              value={`${stats.doneSections}/${stats.totalSections}`}
              label="Sections complete"
            />
            <Stat
              icon={ShieldCheck}
              value={`${stats.doneGates}/${stats.totalGates}`}
              label="Verification gates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

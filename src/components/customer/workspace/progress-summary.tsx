"use client";

import type { Customer } from "@/lib/customer/types";
import { computeProgress } from "@/lib/customer/service";
import { useCatalog } from "@/components/providers/catalog-provider";

export function ProgressSummary({
  customer,
  allStepIds,
}: {
  customer: Customer;
  allStepIds: string[];
}) {
  const { sections } = useCatalog();
  const { done, total, percent } = computeProgress(customer, allStepIds);
  const gates = sections.flatMap((s) => s.steps.filter((st) => st.gate));
  const gatesDone = gates.filter((g) => customer.checklist[g.id]?.done).length;
  const sectionsDone = sections.filter(
    (s) => s.steps.length > 0 && s.steps.every((st) => customer.checklist[st.id]?.done),
  ).length;

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
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
              className="transition-[stroke-dashoffset] duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-lg font-semibold tabular-nums">{percent}%</span>
          </div>
        </div>
        <div className="min-w-0 space-y-1.5 text-sm">
          <Row label="Tasks" value={`${done} / ${total}`} />
          <Row label="Sections" value={`${sectionsDone} / ${sections.length}`} />
          <Row label="Gates" value={`${gatesDone} / ${gates.length}`} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, Circle, Loader2, ClipboardList, ArrowRight } from "lucide-react";

import type { Customer } from "@/lib/customer/types";
import type { Section } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type MilestoneStatus = "complete" | "active" | "upcoming";

function statusOf(section: Section, customer: Customer): { status: MilestoneStatus; done: number; total: number } {
  const total = section.steps.length;
  const done = section.steps.filter((s) => customer.checklist[s.id]?.done).length;
  const status: MilestoneStatus = total > 0 && done === total ? "complete" : done > 0 ? "active" : "upcoming";
  return { status, done, total };
}

/**
 * Customer-facing progress view. Shows a headline percentage over the
 * customer-facing milestones, the actions we still need from the customer, and
 * the onboarding journey as a milestone timeline. Read-only: it reflects the
 * progress the BuildVision team records internally (true two-way sync needs a
 * backend — see the portal page notes).
 */
export function PortalJourney({
  customer,
  sections,
}: {
  customer: Customer;
  sections: Section[];
}) {
  const milestones = sections; // already filtered to customerFacing by the caller

  const totalSteps = milestones.reduce((n, s) => n + s.steps.length, 0);
  const doneSteps = milestones.reduce(
    (n, s) => n + s.steps.filter((st) => customer.checklist[st.id]?.done).length,
    0,
  );
  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  const milestonesDone = milestones.filter((s) => statusOf(s, customer).status === "complete").length;

  // Things the customer still owns: incomplete steps whose owners include CUST.
  const yourActions = milestones
    .flatMap((s) => s.steps)
    .filter((st) => st.owners?.includes("CUST") && !customer.checklist[st.id]?.done)
    .map((st) => st.title);

  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="space-y-6">
      {/* Progress headline */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-5">
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
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Your onboarding progress</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {milestonesDone} of {milestones.length} milestones complete
              {percent === 100 && " — you're all set! 🎉"}
            </p>
          </div>
        </div>

        {/* What we need from you */}
        {yourActions.length > 0 && (
          <div className="mt-5 rounded-lg border border-primary/25 bg-primary/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ClipboardList className="size-4" /> What we need from you
            </p>
            <ul className="mt-2 space-y-1.5">
              {yourActions.map((title) => (
                <li key={title} className="flex items-start gap-2 text-sm text-foreground/90">
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Milestone timeline */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Onboarding journey</h2>
        <ol className="relative space-y-1">
          {milestones.map((section, i) => (
            <Milestone
              key={section.slug}
              section={section}
              customer={customer}
              last={i === milestones.length - 1}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

function Milestone({
  section,
  customer,
  last,
}: {
  section: Section;
  customer: Customer;
  last: boolean;
}) {
  const { status, done, total } = statusOf(section, customer);
  const Icon = getIcon(section.icon);

  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {/* Connector line */}
      {!last && (
        <span
          aria-hidden
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px",
            status === "complete" ? "bg-[var(--success)]/40" : "bg-border",
          )}
        />
      )}
      {/* Status node */}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          status === "complete" && "border-transparent bg-[var(--success)] text-[var(--success-foreground)]",
          status === "active" && "border-primary bg-primary/10 text-primary",
          status === "upcoming" && "border-border bg-muted text-muted-foreground",
        )}
      >
        {status === "complete" ? (
          <Check className="size-4" strokeWidth={3} />
        ) : status === "active" ? (
          <Loader2 className="size-4" />
        ) : (
          <Circle className="size-3" />
        )}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium">{section.title}</p>
          <span
            className={cn(
              "ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              status === "complete" && "bg-[var(--success)]/12 text-[var(--success)]",
              status === "active" && "bg-primary/10 text-primary",
              status === "upcoming" && "bg-muted text-muted-foreground",
            )}
          >
            {status === "complete" ? "Complete" : status === "active" ? "In progress" : "Upcoming"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{section.summary}</p>
        {total > 0 && status !== "upcoming" && (
          <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {done}/{total} steps
          </p>
        )}
      </div>
    </li>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronDown, ClipboardList, FileText, ArrowUpRight } from "lucide-react";

import type { Section, Step } from "@/lib/types";
import type { ChecklistState } from "@/lib/customer/types";
import { getIcon } from "@/lib/icons";
import { asset, cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

/**
 * The guide for a section: an explicit, real resource only (the section's PDF
 * guide, or a per-step override). No auto-generated fallback links — a section
 * without a real guide simply shows none.
 */
function sectionGuide(section: Section): { label: string; href: string } | undefined {
  return section.clientGuide;
}

function resolveHref(href: string): string {
  return href.startsWith("/") ? asset(href) : href;
}

function isDone(checklist: ChecklistState, id: string): boolean {
  return Boolean(checklist[id]?.done);
}

/**
 * Interactive, customer-facing onboarding checklist. The customer can check off
 * any step; each task links to a how-to guide. Toggling persists to the shared
 * record (so the BuildVision team sees the same progress). Read-only when
 * `onToggle` is omitted.
 */
export function PortalJourney({
  sections,
  checklist,
  onToggle,
}: {
  sections: Section[];
  checklist: ChecklistState;
  onToggle?: (step: Step, done: boolean) => void;
}) {
  const totalSteps = sections.reduce((n, s) => n + s.steps.length, 0);
  const doneSteps = sections.reduce((n, s) => n + s.steps.filter((st) => isDone(checklist, st.id)).length, 0);
  const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);

  const yourActions = sections
    .flatMap((s) => s.steps.map((st) => ({ section: s, step: st })))
    .filter(({ step }) => step.owners?.includes("CUST") && !isDone(checklist, step.id));

  // The section currently being worked through = the first one that isn't fully
  // complete (in order). Everything before it is done; everything after is upcoming.
  const activeSlug = React.useMemo(() => {
    for (const s of sections) {
      const done = s.steps.filter((st) => isDone(checklist, st.id)).length;
      if (s.steps.length === 0 || done < s.steps.length) return s.slug;
    }
    return null; // all complete
  }, [sections, checklist]);

  // Guided accordion: expand only the active section; collapse completed and
  // upcoming ones. When the customer finishes the active section, it collapses and
  // the next one opens automatically. Manual expand/collapse still works.
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(activeSlug ? [activeSlug] : []));
  const prevActive = React.useRef(activeSlug);
  React.useEffect(() => {
    if (prevActive.current === activeSlug) return;
    setOpen((prev) => {
      const next = new Set(prev);
      if (prevActive.current) next.delete(prevActive.current);
      if (activeSlug) next.add(activeSlug);
      return next;
    });
    prevActive.current = activeSlug;
  }, [activeSlug]);

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
              {doneSteps} of {totalSteps} steps complete
              {percent === 100 && " — you're all set! 🎉"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check off each step as you go — your BuildVision team sees your progress live.
            </p>
          </div>
        </div>

        {yourActions.length > 0 && (
          <div className="mt-5 rounded-lg border border-primary/25 bg-primary/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ClipboardList className="size-4" /> What we need from you
            </p>
            <ul className="mt-2 space-y-1.5">
              {yourActions.map(({ step }) => (
                <li key={step.id} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {step.customerLabel ?? step.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Checklist by section */}
      <div className="space-y-2.5">
        {sections.map((section) => {
          const Icon = getIcon(section.icon);
          const done = section.steps.filter((st) => isDone(checklist, st.id)).length;
          const total = section.steps.length;
          const allDone = total > 0 && done === total;
          const isOpen = open.has(section.slug);
          return (
            <div key={section.slug} className="overflow-hidden rounded-xl border border-border bg-card">
              <Collapsible
                open={isOpen}
                onOpenChange={(o) =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (o) next.add(section.slug);
                    else next.delete(section.slug);
                    return next;
                  })
                }
              >
                <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-accent/40">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      allDone ? "bg-[var(--success)] text-[var(--success-foreground)]" : "bg-primary/10 text-primary",
                    )}
                  >
                    {allDone ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{section.customerTitle ?? section.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {section.customerSummary ?? section.summary}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                    {done}/{total}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-1 border-t border-border/60 p-2">
                    {sectionGuide(section) && (
                      <a
                        href={resolveHref(sectionGuide(section)!.href)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-1 mb-1 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
                      >
                        <FileText className="size-3.5" />
                        {sectionGuide(section)!.label}
                        <ArrowUpRight className="size-3 text-muted-foreground" />
                      </a>
                    )}
                    {section.steps.map((step) => (
                      <StepRow
                        key={step.id}
                        step={step}
                        done={isDone(checklist, step.id)}
                        completedByCustomer={checklist[step.id]?.completedBy === "Customer"}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepRow({
  step,
  done,
  completedByCustomer,
  onToggle,
}: {
  step: Step;
  done: boolean;
  completedByCustomer: boolean;
  onToggle?: (step: Step, done: boolean) => void;
}) {
  const label = step.customerLabel ?? step.title;
  return (
    <div className={cn("flex items-start gap-3 rounded-lg p-2.5", done && "opacity-70")}>
      <Checkbox
        checked={done}
        disabled={!onToggle}
        onCheckedChange={(v) => onToggle?.(step, Boolean(v))}
        className="mt-0.5"
        aria-label={`Mark "${label}" ${done ? "not done" : "done"}`}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", done && "text-muted-foreground line-through decoration-muted-foreground/40")}>
          {label}
        </p>
        {done && completedByCustomer && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--success)]">
            <Check className="size-3" /> You marked this done
          </span>
        )}
      </div>
    </div>
  );
}

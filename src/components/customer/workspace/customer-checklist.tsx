"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Check, StickyNote, ChevronsDownUp, ChevronsUpDown, Filter } from "lucide-react";

import type { Customer } from "@/lib/customer/types";
import type { Section, Step } from "@/lib/types";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useCustomers } from "@/lib/customer/store";
import { getIcon } from "@/lib/icons";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Markdown } from "@/components/markdown";
import { Callout } from "@/components/callout";
import { OwnerBadges, TimePill, GateBadge } from "@/components/content-badges";

export function CustomerChecklist({
  customer,
  allStepIds,
}: {
  customer: Customer;
  allStepIds: string[];
}) {
  const { sections } = useCatalog();
  const doneTotal = allStepIds.reduce((n, id) => n + (customer.checklist[id]?.done ? 1 : 0), 0);

  // Sections start collapsed; press a section header (or "Expand all") to open one.
  const [openSections, setOpenSections] = React.useState<Set<string>>(() => new Set());
  const [hideCompleted, setHideCompleted] = React.useState(false);
  const allOpen = openSections.size === sections.length;

  return (
    <section aria-labelledby="checklist-heading" className="scroll-mt-20" id="checklist">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="checklist-heading" className="text-sm font-semibold">
            Onboarding checklist
          </h2>
          <p className="text-xs text-muted-foreground">
            {doneTotal} of {allStepIds.length} tasks complete
          </p>
        </div>
        <div className="flex items-center gap-1.5 no-print">
          <Button
            variant={hideCompleted ? "default" : "outline"}
            size="sm"
            onClick={() => setHideCompleted((v) => !v)}
          >
            <Filter />
            {hideCompleted ? "Showing open" : "Hide done"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setOpenSections(allOpen ? new Set() : new Set(sections.map((s) => s.slug)))
            }
          >
            {allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        {sections.map((section) => (
          <SectionBlock
            key={section.slug}
            section={section}
            customer={customer}
            allStepIds={allStepIds}
            hideCompleted={hideCompleted}
            open={openSections.has(section.slug)}
            onToggle={(o) =>
              setOpenSections((prev) => {
                const next = new Set(prev);
                if (o) next.add(section.slug);
                else next.delete(section.slug);
                return next;
              })
            }
          />
        ))}
      </div>
    </section>
  );
}

function SectionBlock({
  section,
  customer,
  allStepIds,
  hideCompleted,
  open,
  onToggle,
}: {
  section: Section;
  customer: Customer;
  allStepIds: string[];
  hideCompleted: boolean;
  open: boolean;
  onToggle: (open: boolean) => void;
}) {
  const Icon = getIcon(section.icon);
  const done = section.steps.filter((s) => customer.checklist[s.id]?.done).length;
  const total = section.steps.length;
  const allDone = done === total;
  const visible = hideCompleted
    ? section.steps.filter((s) => !customer.checklist[s.id]?.done)
    : section.steps;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Collapsible open={open} onOpenChange={onToggle}>
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
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {section.phase}
              </span>
            </div>
            <p className="truncate text-sm font-medium">{section.title}</p>
          </div>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {done}/{total}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 border-t border-border/60 p-3">
            {visible.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                All steps in this section are complete.
              </p>
            ) : (
              visible.map((step) => (
                <CustomerStepItem
                  key={step.id}
                  step={step}
                  section={section}
                  customer={customer}
                  allStepIds={allStepIds}
                />
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function CustomerStepItem({
  step,
  section,
  customer,
  allStepIds,
}: {
  step: Step;
  section: Section;
  customer: Customer;
  allStepIds: string[];
}) {
  const { toggleStep, setStepNote } = useCustomers();
  const state = customer.checklist[step.id];
  const done = Boolean(state?.done);
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState(state?.note ?? "");

  React.useEffect(() => {
    setNote(state?.note ?? "");
  }, [state?.note]);

  const hasDetail = Boolean(step.description || step.verify || step.callouts?.length);

  function saveNote() {
    if ((state?.note ?? "") !== note) setStepNote(customer.id, step.id, note);
  }

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        done ? "border-border/60 bg-muted/30" : "border-border bg-card",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <Checkbox
          checked={done}
          onCheckedChange={(v) => toggleStep(customer.id, { id: step.id, title: step.title }, Boolean(v), allStepIds)}
          className="mt-0.5"
          aria-label={`Mark "${step.title}" ${done ? "incomplete" : "complete"}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium leading-snug",
                done && "text-muted-foreground line-through decoration-muted-foreground/40",
              )}
            >
              {step.title}
            </p>
            {(hasDetail || true) && (
              <button
                onClick={() => setOpen((o) => !o)}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground no-print"
                aria-label={open ? "Collapse" : "Expand"}
              >
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {step.gate && <GateBadge />}
            <OwnerBadges owners={step.owners} />
            <TimePill time={step.time} />
            {done && state?.completedBy && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                <Check className="size-3" /> {state.completedBy} · {formatRelative(state.completedAt)}
              </span>
            )}
            {!open && note && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <StickyNote className="size-3" /> note
              </span>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border/60 px-3 py-3 pl-[3rem]">
          {step.description && <Markdown>{step.description}</Markdown>}
          {step.verify && (
            <div className="rounded-md bg-[color-mix(in_oklch,var(--success)_8%,transparent)] px-3 py-2 text-sm">
              <span className="font-semibold text-[var(--success)]">Verify: </span>
              <span className="text-foreground/90">{step.verify}</span>
            </div>
          )}
          {step.callouts?.map((c, i) => (
            <Callout key={i} type={c.type} text={c.text} />
          ))}
          <div className="no-print">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <StickyNote className="size-3.5" /> Note for this task
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={saveNote}
              rows={2}
              placeholder="Add context, blockers, or who to follow up with…"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Link
            href={`/sections/${section.slug}`}
            className="inline-block text-xs text-primary hover:underline no-print"
          >
            Open full SOP for this section →
          </Link>
        </div>
      )}
    </div>
  );
}

"use client";

import { ChevronDown, Link2 } from "lucide-react";

import type { Step } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Callout } from "@/components/callout";
import { Markdown } from "@/components/markdown";
import { OwnerBadges, TimePill, GateBadge } from "@/components/content-badges";

export function StepItem({
  step,
  index,
  done,
  onToggleDone,
  open,
  onOpenChange,
}: {
  step: Step;
  index: number;
  done: boolean;
  onToggleDone: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const hasDetail =
    Boolean(step.description) ||
    Boolean(step.verify) ||
    Boolean(step.dependsOn) ||
    Boolean(step.callouts?.length);

  return (
    <div
      id={step.id}
      className={cn(
        "scroll-mt-20 rounded-lg border transition-colors",
        done ? "border-border/60 bg-muted/30" : "border-border bg-card",
        step.gate && !done && "border-[color-mix(in_oklch,var(--success)_35%,transparent)]",
      )}
    >
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <div className="flex items-start gap-3 p-3.5">
          <Checkbox
            checked={done}
            onCheckedChange={onToggleDone}
            className="mt-0.5"
            aria-label={`Mark "${step.title}" ${done ? "incomplete" : "complete"}`}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step.gate && <GateBadge />}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-medium leading-snug",
                    done && "text-muted-foreground line-through decoration-muted-foreground/40",
                  )}
                >
                  {step.title}
                </p>
              </div>

              {hasDetail && (
                <CollapsibleTrigger
                  className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={open ? "Collapse details" : "Expand details"}
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform", open && "rotate-180")}
                  />
                </CollapsibleTrigger>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <OwnerBadges owners={step.owners} />
              <TimePill time={step.time} />
              {step.dependsOn && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Link2 className="size-3" />
                  Depends on: {step.dependsOn}
                </span>
              )}
            </div>
          </div>
        </div>

        {hasDetail && (
          <CollapsibleContent>
            <div className="space-y-3 border-t border-border/60 px-3.5 py-3.5 pl-[3.25rem]">
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
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

"use client";

import { X, Plus } from "lucide-react";

import type { AssociatedOrg } from "@/lib/customer/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RELATIONSHIPS = ["Parent", "Child"];
const EMPTY: AssociatedOrg = { name: "", relationship: "Child" };

/**
 * Repeatable list of associated organizations (name + Parent/Child
 * relationship). Value is an AssociatedOrg[]. Shown on the intake form only
 * when the customer says they have associated organizations.
 */
export function AssociatedOrgList({
  value,
  onChange,
}: {
  value: AssociatedOrg[];
  onChange: (next: AssociatedOrg[]) => void;
}) {
  const items = value.length ? value : [{ ...EMPTY }];

  const update = (i: number, patch: Partial<AssociatedOrg>) => {
    onChange(items.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  };
  const add = () => onChange([...items, { ...EMPTY }]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-border/70 p-2 sm:flex-row sm:items-center">
          <Input
            value={m.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="Organization name"
            className="h-9 sm:flex-1"
            aria-label="Associated organization name"
          />
          <div className="flex items-center gap-2">
            <select
              value={m.relationship || "Child"}
              onChange={(e) => update(i, { relationship: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Relationship"
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove associated organization"
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-destructive",
              )}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="size-4" /> Add another organization
      </button>
    </div>
  );
}

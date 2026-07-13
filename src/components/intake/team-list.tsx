"use client";

import { X, Plus } from "lucide-react";

import type { TeamMember } from "@/lib/customer/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROLES = ["Admin", "Member"];
const EMPTY: TeamMember = { name: "", email: "", role: "Member" };

/**
 * Repeatable list of users to provision (name, email, Admin/Member). Value is a
 * TeamMember[]. Used by the public intake form and the customer-page editor.
 */
export function TeamMemberList({
  value,
  onChange,
}: {
  value: TeamMember[];
  onChange: (next: TeamMember[]) => void;
}) {
  const items = value.length ? value : [{ ...EMPTY }];

  const update = (i: number, patch: Partial<TeamMember>) => {
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
            placeholder="Full name"
            className="h-9 sm:flex-1"
          />
          <Input
            type="email"
            value={m.email}
            onChange={(e) => update(i, { email: e.target.value })}
            placeholder="name@company.com"
            className="h-9 sm:flex-1"
          />
          <div className="flex items-center gap-2">
            <select
              value={m.role || "Member"}
              onChange={(e) => update(i, { role: e.target.value })}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Permission level"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove user"
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
        <Plus className="size-4" /> Add user
      </button>
    </div>
  );
}

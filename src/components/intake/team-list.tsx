"use client";

import { X, Plus } from "lucide-react";

import type { TeamMember } from "@/lib/customer/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMPTY: TeamMember = { firstName: "", lastName: "", email: "" };

/**
 * Repeatable list of users to provision (first name, last name, email). Value
 * is a TeamMember[]. Used by the public intake form and the customer-page
 * editor. "Add user" appends another row; each row can be removed.
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
            value={m.firstName}
            onChange={(e) => update(i, { firstName: e.target.value })}
            placeholder="First name"
            className="h-9 sm:flex-1"
            aria-label="First name"
          />
          <Input
            value={m.lastName}
            onChange={(e) => update(i, { lastName: e.target.value })}
            placeholder="Last name"
            className="h-9 sm:flex-1"
            aria-label="Last name"
          />
          <div className="flex items-center gap-2 sm:flex-[1.4]">
            <Input
              type="email"
              value={m.email}
              onChange={(e) => update(i, { email: e.target.value })}
              placeholder="name@company.com"
              className="h-9 flex-1"
              aria-label="Email"
            />
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
        <Plus className="size-4" /> Add another user
      </button>
    </div>
  );
}

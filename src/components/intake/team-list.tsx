"use client";

import { X, Plus } from "lucide-react";

import type { TeamMember } from "@/lib/customer/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROLES = ["Standard user", "Admin"];
const BID_DESK = ["No", "Yes"];
const EMPTY: TeamMember = { firstName: "", lastName: "", email: "", role: "Standard user", bidDesk: "No" };

const selectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The first user (the primary contact) is always an Admin. */
function withFirstAdmin(list: TeamMember[]): TeamMember[] {
  return list.map((m, i) => (i === 0 ? { ...m, role: "Admin" } : m));
}

/**
 * Repeatable list of users to provision. Each user has a name, email, a role and
 * a Yes/No "bid desk coordinator" flag. The FIRST user is the primary contact
 * and is always an Admin (role is locked); additional users can be Admin or a
 * Standard user. Value is a TeamMember[]. Used by the intake form and the
 * customer-page editor.
 */
export function TeamMemberList({
  value,
  onChange,
}: {
  value: TeamMember[];
  onChange: (next: TeamMember[]) => void;
}) {
  const items = withFirstAdmin(value.length ? value : [{ ...EMPTY }]);

  // All mutations keep the first user pinned to Admin.
  const commit = (list: TeamMember[]) => onChange(withFirstAdmin(list));
  const update = (i: number, patch: Partial<TeamMember>) =>
    commit(items.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const add = () => commit([...items, { ...EMPTY }]);
  const remove = (i: number) => commit(items.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {items.map((m, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border/70 p-2">
          {/* Name + email */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
            <Input
              type="email"
              value={m.email}
              onChange={(e) => update(i, { email: e.target.value })}
              placeholder="name@company.com"
              className="h-9 sm:flex-1"
              aria-label="Email"
            />
          </div>
          {/* Role + bid desk coordinator + remove */}
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Role
              {i === 0 ? (
                <span
                  className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-2 text-sm text-foreground"
                  title="The primary contact is always an Admin"
                >
                  Admin
                </span>
              ) : (
                <select
                  value={m.role || "Standard user"}
                  onChange={(e) => update(i, { role: e.target.value })}
                  className={selectClass}
                  aria-label="Role"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              Bid desk coordinator
              <select
                value={m.bidDesk || "No"}
                onChange={(e) => update(i, { bidDesk: e.target.value })}
                className={selectClass}
                aria-label="Bid desk coordinator"
              >
                {BID_DESK.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            {/* The first user (primary contact) can't be removed here. */}
            {i > 0 && (
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove user"
                className={cn(
                  "mb-0.5 ml-auto flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-destructive",
                )}
              >
                <X className="size-4" />
              </button>
            )}
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

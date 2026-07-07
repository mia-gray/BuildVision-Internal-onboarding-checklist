"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Copy, Archive, ArchiveRestore, Trash2, ExternalLink } from "lucide-react";

import type { Customer } from "@/lib/customer/types";
import { computeProgress } from "@/lib/customer/service";
import { useCustomers } from "@/lib/customer/store";
import { customerPath } from "@/lib/customer/paths";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CustomerAvatar } from "./avatar";
import { CustomerStatusBadge } from "./status-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CustomerRow({
  customer,
  allStepIds,
}: {
  customer: Customer;
  allStepIds: string[];
}) {
  const router = useRouter();
  const { duplicate, setArchived, remove } = useCustomers();
  const { done, total, percent } = computeProgress(customer, allStepIds);

  function onDuplicate() {
    const copy = duplicate(customer.id);
    if (copy) router.push(customerPath(copy.id));
  }

  function onDelete() {
    if (confirm(`Delete "${customer.name}"? This removes all its onboarding data and cannot be undone.`)) {
      remove(customer.id);
    }
  }

  return (
    <div
      className={cn(
        "group relative grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30",
        "sm:grid-cols-[1.6fr_0.9fr_1.2fr_1fr_auto] sm:items-center",
        customer.archived && "opacity-60",
      )}
    >
      {/* name + avatar (whole row is a link via overlay) */}
      <Link
        href={customerPath(customer.id)}
        className="flex items-center gap-3 outline-none"
        aria-label={`Open ${customer.name}`}
      >
        <CustomerAvatar name={customer.name} logoUrl={customer.logoUrl} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{customer.name}</p>
          <p className="truncate text-xs text-muted-foreground">{customer.companyName}</p>
        </div>
      </Link>

      {/* status */}
      <div className="flex items-center sm:justify-start">
        <CustomerStatusBadge status={customer.status} />
      </div>

      {/* progress */}
      <div className="flex items-center gap-2.5">
        <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full", percent === 100 ? "bg-[var(--success)]" : "bg-primary")}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {done}/{total}
        </span>
      </div>

      {/* CSM + dates */}
      <div className="min-w-0 text-xs text-muted-foreground">
        <p className="truncate text-foreground/80">{customer.assignedCsm}</p>
        <p className="truncate">
          Updated {formatRelative(customer.updatedAt)} · Created {formatDate(customer.createdAt)}
        </p>
      </div>

      {/* actions */}
      <div className="absolute right-3 top-3 sm:static">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Customer actions"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={customerPath(customer.id)}>
                <ExternalLink /> Open
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setArchived(customer.id, !customer.archived)}>
              {customer.archived ? <ArchiveRestore /> : <Archive />}
              {customer.archived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

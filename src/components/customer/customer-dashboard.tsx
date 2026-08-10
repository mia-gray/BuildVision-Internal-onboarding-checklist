"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Users, ArrowUpDown, Clock, Link2, Check } from "lucide-react";

import { useCustomers } from "@/lib/customer/store";
import { computeProgress } from "@/lib/customer/service";
import { CUSTOMER_STATUSES, type CustomerStatus } from "@/lib/customer/types";
import { useAllStepIds } from "@/lib/customer/use-steps";
import { customerPath, salesIntakePath } from "@/lib/customer/paths";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { asset, cn } from "@/lib/utils";
import { CustomerRow } from "./customer-row";
import { CreateCustomerDialog } from "./create-customer-dialog";
import { CustomerAvatar } from "./avatar";
import { LocalImportBanner } from "./local-import-banner";

type SortKey = "updated" | "created" | "name" | "progress" | "status";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "updated", label: "Last updated" },
  { key: "created", label: "Recently created" },
  { key: "name", label: "Name A–Z" },
  { key: "progress", label: "% complete" },
  { key: "status", label: "Status" },
];

const STATUS_ORDER: Record<CustomerStatus, number> = {
  not_started: 0,
  intake_received: 1,
  in_progress: 2,
  waiting_on_customer: 3,
  completed: 4,
};

export function CustomerDashboard() {
  const { customers, loading, recentIds, getCustomer } = useCustomers();
  const allStepIds = useAllStepIds();

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"all" | CustomerStatus>("all");
  const [onlyNew, setOnlyNew] = React.useState(false);
  const [sort, setSort] = React.useState<SortKey>("updated");
  const [showArchived, setShowArchived] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = customers.filter((c) => {
      if (!showArchived && c.archived) return false;
      if (onlyNew && c.reviewed !== false) return false;
      if (status !== "all" && c.status !== status) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.companyName.toLowerCase().includes(q) &&
        !c.assignedCsm.toLowerCase().includes(q)
      )
        return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return b.createdAt.localeCompare(a.createdAt);
        case "progress":
          return (
            computeProgress(b, allStepIds).percent - computeProgress(a, allStepIds).percent
          );
        case "status":
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        case "updated":
        default:
          return b.updatedAt.localeCompare(a.updatedAt);
      }
    });
    return list;
  }, [customers, query, status, onlyNew, sort, showArchived, allStepIds]);

  const activeCount = customers.filter((c) => !c.archived).length;
  const newCount = customers.filter((c) => !c.archived && c.reviewed === false).length;
  const recent = recentIds.map(getCustomer).filter(Boolean).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? "Loading…"
              : `${activeCount} customer${activeCount === 1 ? "" : "s"} onboarding`}
            {!loading && newCount > 0 && (
              <>
                {" · "}
                <button
                  onClick={() => {
                    setOnlyNew(true);
                    setStatus("all");
                  }}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  {newCount} new to review
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SalesIntakeLinkButton />
          <CreateCustomerDialog />
        </div>
      </div>

      {/* One-time import of browser-only customers into the shared backend */}
      <LocalImportBanner />

      {/* Recently viewed */}
      {recent.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Recent
          </span>
          {recent.map(
            (c) =>
              c && (
                <Link
                  key={c.id}
                  href={customerPath(c.id)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-xs transition-colors hover:bg-accent"
                >
                  <CustomerAvatar name={c.name} logoUrl={c.logoUrl} size="sm" className="size-6 rounded-full text-[10px]" />
                  <span className="max-w-[140px] truncate">{c.name}</span>
                </Link>
              ),
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-xs lg:flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            className="pl-9"
          />
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={!onlyNew && status === "all"} onClick={() => { setOnlyNew(false); setStatus("all"); }}>
              All
            </FilterChip>
            {newCount > 0 && (
              <FilterChip active={onlyNew} onClick={() => { setOnlyNew(true); setStatus("all"); }}>
                New{" "}
                <span className={cn("ml-1 rounded-full px-1.5 text-[10px]", onlyNew ? "bg-primary/20" : "bg-primary/10 text-primary")}>
                  {newCount}
                </span>
              </FilterChip>
            )}
            {CUSTOMER_STATUSES.map((s) => (
              <FilterChip key={s.value} active={!onlyNew && status === s.value} onClick={() => { setOnlyNew(false); setStatus(s.value); }}>
                {s.label}
              </FilterChip>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="size-3.5" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasCustomers={customers.length > 0} />
      ) : (
        <>
          {/* column labels (desktop) */}
          <div className="hidden px-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 sm:grid sm:grid-cols-[1.6fr_0.9fr_1.2fr_1fr_auto] sm:gap-3">
            <span>Customer</span>
            <span>Status</span>
            <span>Progress</span>
            <span>CSM / dates</span>
            <span className="w-8" />
          </div>
          <div className="space-y-2">
            {filtered.map((c) => (
              <CustomerRow key={c.id} customer={c} allStepIds={allStepIds} />
            ))}
          </div>
        </>
      )}

      {/* archived toggle */}
      {customers.some((c) => c.archived) && (
        <button
          onClick={() => setShowArchived((v) => !v)}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {showArchived ? "Hide archived" : `Show archived (${customers.filter((c) => c.archived).length})`}
        </button>
      )}
    </div>
  );
}

/** Copies the one permanent, reusable Sales Intake link for the sales team. */
function SalesIntakeLinkButton() {
  const [copied, setCopied] = React.useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${asset(salesIntakePath())}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      title="Copy the permanent Sales Intake link — sales fills it out to auto-create a customer"
    >
      {copied ? <Check className="text-[var(--success)]" /> : <Link2 />}
      {copied ? "Link copied" : "Sales intake link"}
    </Button>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasCustomers }: { hasCustomers: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Users className="size-6" />
      </span>
      <p className="text-sm font-medium">{hasCustomers ? "No customers match your filters" : "No customers yet"}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasCustomers
          ? "Try clearing the search or status filter."
          : "Create your first customer to start an onboarding workspace."}
      </p>
      {!hasCustomers && (
        <div className="mt-5">
          <CreateCustomerDialog />
        </div>
      )}
    </div>
  );
}

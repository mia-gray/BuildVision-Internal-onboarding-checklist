"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Mail,
  MoreHorizontal,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Printer,
  Send,
  Check,
  ChevronDown,
} from "lucide-react";

import type { Customer } from "@/lib/customer/types";
import { CUSTOMER_STATUSES } from "@/lib/customer/types";
import { computeProgress } from "@/lib/customer/service";
import { useCustomers } from "@/lib/customer/store";
import { intakePath, customerPath } from "@/lib/customer/paths";
import { asset, cn } from "@/lib/utils";
import { formatDate, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CustomerAvatar } from "../avatar";
import { CustomerStatusBadge } from "../status-badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function CustomerHeader({
  customer,
  allStepIds,
}: {
  customer: Customer;
  allStepIds: string[];
}) {
  const router = useRouter();
  const { setStatus, duplicate, setArchived, remove, markIntakeSent } = useCustomers();
  const { done, total, percent } = computeProgress(customer, allStepIds);
  const [copied, setCopied] = React.useState(false);
  const [intakeUrl, setIntakeUrl] = React.useState("");

  React.useEffect(() => {
    setIntakeUrl(`${window.location.origin}${asset(intakePath(customer.id))}`);
  }, [customer.id]);

  async function copyIntake() {
    try {
      await navigator.clipboard.writeText(intakeUrl);
      markIntakeSent(customer.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  function emailIntake() {
    const to = customer.intake.email ?? "";
    const subject = encodeURIComponent("Your BuildVision onboarding intake form");
    const body = encodeURIComponent(
      `Hi${customer.intake.primaryContact ? " " + customer.intake.primaryContact.split(",")[0] : ""},\n\n` +
        `To kick off your BuildVision onboarding, please complete this short intake form:\n${intakeUrl}\n\n` +
        `Thanks,\n${customer.assignedCsm}`,
    );
    markIntakeSent(customer.id);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  function onDelete() {
    if (confirm(`Delete "${customer.name}"? This cannot be undone.`)) {
      remove(customer.id);
      router.push("/");
    }
  }

  function onDuplicate() {
    const copy = duplicate(customer.id);
    if (copy) router.push(customerPath(copy.id));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <CustomerAvatar name={customer.name} logoUrl={customer.logoUrl} size="lg" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{customer.name}</h1>
            <p className="text-sm text-muted-foreground">{customer.companyName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                CSM <span className="text-foreground/80">{customer.assignedCsm}</span>
              </span>
              <span>
                Started <span className="text-foreground/80">{formatDate(customer.createdAt)}</span>
              </span>
              <span>
                Updated <span className="text-foreground/80">{formatRelative(customer.updatedAt)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status control */}
        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <CustomerStatusBadge status={customer.status} />
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              {CUSTOMER_STATUSES.map((s) => (
                <DropdownMenuItem key={s.value} onClick={() => setStatus(customer.id, s.value)}>
                  <CustomerStatusBadge status={s.value} />
                  {customer.status === s.value && <Check className="ml-auto size-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              percent === 100 ? "bg-[var(--success)]" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {done} of {total} · {percent}%
        </span>
      </div>

      {/* Quick actions */}
      <div className="mt-5 flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={copyIntake}>
          {copied ? <Check className="text-[var(--success)]" /> : <Link2 />}
          {copied ? "Link copied" : "Copy intake link"}
        </Button>
        <Button variant="outline" size="sm" onClick={emailIntake}>
          <Mail /> Email intake link
        </Button>
        <a
          href={asset(intakePath(customer.id))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
        >
          <Send className="size-3.5" /> Open intake form
        </a>
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground shadow-sm transition-colors hover:bg-accent"
              aria-label="More actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer /> Export to PDF (print)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy /> Duplicate customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setArchived(customer.id, !customer.archived)}>
                {customer.archived ? <ArchiveRestore /> : <Archive />}
                {customer.archived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 /> Delete customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

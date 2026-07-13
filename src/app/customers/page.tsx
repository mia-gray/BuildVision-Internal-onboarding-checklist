"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, UserX } from "lucide-react";

import { useCustomers } from "@/lib/customer/store";
import { useAllStepIds } from "@/lib/customer/use-steps";
import { Button } from "@/components/ui/button";
import { CustomerHeader } from "@/components/customer/workspace/customer-header";
import { IntakeSurvey } from "@/components/customer/workspace/intake-survey";
import { CustomerChecklist } from "@/components/customer/workspace/customer-checklist";
import { CustomerDocuments } from "@/components/customer/workspace/customer-documents";
import { CustomerNotes } from "@/components/customer/workspace/customer-notes";
import { CustomerTimeline } from "@/components/customer/workspace/customer-timeline";
import { ProgressSummary } from "@/components/customer/workspace/progress-summary";

function Workspace() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { getCustomer, loading, pushRecent } = useCustomers();
  const allStepIds = useAllStepIds();
  const customer = getCustomer(id);

  React.useEffect(() => {
    if (customer) {
      pushRecent(customer.id);
      document.title = `${customer.name} · Customer Onboarding`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <UserX className="size-6" />
        </span>
        <p className="text-sm font-medium">Customer not found</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          This customer doesn&apos;t exist in this browser, or was removed.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">Back to customers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground no-print">
        <Link href="/" className="hover:text-foreground">
          Customers
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground">{customer.name}</span>
      </nav>

      <CustomerHeader customer={customer} allStepIds={allStepIds} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <IntakeSurvey customer={customer} />
          <CustomerChecklist customer={customer} allStepIds={allStepIds} />
          <CustomerDocuments customer={customer} />
        </div>
        <aside className="space-y-6">
          <ProgressSummary customer={customer} allStepIds={allStepIds} />
          <CustomerTimeline customer={customer} />
          <CustomerNotes customer={customer} />
        </aside>
      </div>
    </div>
  );
}

export default function CustomerPage() {
  return (
    <React.Suspense fallback={<div className="h-40 animate-pulse rounded-xl border border-border bg-card" />}>
      <Workspace />
    </React.Suspense>
  );
}

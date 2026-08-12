"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { salesIntakeCreate } from "@/lib/customer/public-access";
import { useCustomers } from "@/lib/customer/store";
import { asset } from "@/lib/utils";
import type { IntakeSurvey } from "@/lib/customer/types";
import type { SubmitNotice } from "@/components/intake/intake-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { IntakeForm } from "@/components/intake/intake-form";

const CREATED_NOTICE: SubmitNotice = {
  title: "New customer submitted 🎉",
  body: "The account has been created and the BuildVision onboarding team has been notified. They'll review the details and take it from here.",
};

const DUPLICATE_NOTICE: SubmitNotice = {
  title: "Already in our system",
  body: "This customer looks like it's already been submitted, so we've flagged it for the onboarding team rather than creating a duplicate. No need to resubmit.",
};

function SalesIntakeInner() {
  const store = useCustomers();

  // Permanent, reusable link: always a blank form. On submit we auto-create the
  // customer account — via the anonymous RPC in backend mode, or the local store
  // in single-browser mode. Existing customers' portal links are never touched.
  const onSubmit = React.useCallback(
    async (values: IntakeSurvey): Promise<{ notice: SubmitNotice }> => {
      if (isSupabaseConfigured) {
        const res = await salesIntakeCreate(values);
        if (res.error) throw new Error(res.error);
        return { notice: res.status === "duplicate" ? DUPLICATE_NOTICE : CREATED_NOTICE };
      }
      const res = store.createFromSalesIntake(values);
      return { notice: res.status === "duplicate" ? DUPLICATE_NOTICE : CREATED_NOTICE };
    },
    [store],
  );

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Branded top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2">
            <img src={asset("/brand/wordmark-on-light.png")} alt="BuildVision" className="h-5 w-auto dark:hidden" />
            <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="hidden h-5 w-auto dark:block" />
            <span className="ml-1 hidden text-sm text-muted-foreground sm:inline">Sales Intake</span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <IntakeForm
          onSubmit={onSubmit}
          heading="New Organization"
          subheading=""
          submitLabel="Create Organization"
        />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Questions? <a className="text-primary hover:underline" href="mailto:support@buildvision.io">support@buildvision.io</a>
      </footer>
    </div>
  );
}

export default function SalesIntakePage() {
  return (
    <React.Suspense fallback={<div className="min-h-[100dvh] bg-background" />}>
      <SalesIntakeInner />
    </React.Suspense>
  );
}

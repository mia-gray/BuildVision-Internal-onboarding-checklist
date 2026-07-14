"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useIntakeCustomer, submitIntakePublic } from "@/lib/customer/public-access";
import { asset } from "@/lib/utils";
import type { IntakeSurvey } from "@/lib/customer/types";
import { ThemeToggle } from "@/components/theme-toggle";
import { IntakeForm } from "@/components/intake/intake-form";

function IntakeInner() {
  const params = useSearchParams();
  const id = params.get("customer") ?? "";
  const { customer, loading } = useIntakeCustomer(id);

  // In backend mode, anonymous clients submit via the token-scoped RPC.
  const onSubmit = isSupabaseConfigured
    ? async (values: IntakeSurvey) => {
        const err = await submitIntakePublic(id, values);
        if (err) throw new Error(err);
      }
    : undefined;

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Branded top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2">
            <img src={asset("/brand/wordmark-on-light.png")} alt="BuildVision" className="h-5 w-auto dark:hidden" />
            <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="hidden h-5 w-auto dark:block" />
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          </div>
        ) : !id || !customer ? (
          <div className="mx-auto max-w-lg py-16 text-center">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Link2 className="size-6" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">This intake link isn&apos;t valid</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The link may be incorrect or expired. Please use the most recent link from your
              BuildVision contact, or reply to their email so they can resend it.
            </p>
          </div>
        ) : (
          <IntakeForm customer={customer} onSubmit={onSubmit} />
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Questions? <a className="text-primary hover:underline" href="mailto:support@buildvision.io">support@buildvision.io</a>
      </footer>
    </div>
  );
}

export default function IntakePage() {
  return (
    <React.Suspense fallback={<div className="min-h-[100dvh] bg-background" />}>
      <IntakeInner />
    </React.Suspense>
  );
}

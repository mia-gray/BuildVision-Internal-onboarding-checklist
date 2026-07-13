"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";

import { useCustomers } from "@/lib/customer/store";
import { asset } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomerPortal } from "@/components/portal/customer-portal";

function PortalInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { customers, loading } = useCustomers();
  const customer = token ? customers.find((c) => c.portalToken === token) : undefined;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
          <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!token || !customer) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
            <span className="flex items-center gap-2">
              <img src={asset("/brand/wordmark-on-light.png")} alt="BuildVision" className="h-5 w-auto dark:hidden" />
              <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="hidden h-5 w-auto dark:block" />
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Link2 className="size-6" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">This onboarding link isn&apos;t valid</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The link may be incorrect or expired. Please use the most recent link from your BuildVision
            contact, or reply to their email so they can resend it.
          </p>
        </main>
      </div>
    );
  }

  return <CustomerPortal customer={customer} />;
}

export default function OnboardingPortalPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[100dvh] bg-background" />}>
      <PortalInner />
    </React.Suspense>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";
import {
  LifeBuoy,
  CheckCircle2,
  CalendarClock,
  Building2,
  User,
  Sparkles,
  FileText,
  Link2,
  ExternalLink,
  FolderOpen,
} from "lucide-react";

import type { Customer, ChecklistState } from "@/lib/customer/types";
import type { Step } from "@/lib/types";
import { labelForStatus } from "@/lib/customer/service";
import { useCatalog } from "@/components/providers/catalog-provider";
import { useCustomers } from "@/lib/customer/store";
import { useAllStepIds } from "@/lib/customer/use-steps";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { togglePortalStep } from "@/lib/customer/public-access";
import { asset } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { resolveDocHref, formatBytes } from "@/lib/documents";
import { ThemeToggle } from "@/components/theme-toggle";
import { IntakeForm } from "@/components/intake/intake-form";
import { KnowledgeBase } from "@/components/kb/knowledge-base";
import { CustomerAvatar } from "@/components/customer/avatar";
import { PortalJourney } from "./portal-journey";

/** A short, friendly status line shown in the welcome-back hero. */
function statusMessage(customer: Customer): string {
  switch (customer.status) {
    case "completed":
      return "Your onboarding is complete — welcome aboard! 🎉";
    case "waiting_on_customer":
      return "We're waiting on a couple of things from you — see “What we need from you” below.";
    case "in_progress":
      return "Your onboarding is underway. Here's where things stand.";
    default:
      return "Thanks for your details — we're getting your BuildVision account ready.";
  }
}

export function CustomerPortal({ customer }: { customer: Customer }) {
  const { sections, kb } = useCatalog();
  const store = useCustomers();
  const allStepIds = useAllStepIds();
  const facing = React.useMemo(() => sections.filter((s) => s.customerFacing), [sections]);
  const submitted = customer.intakeSubmitted;

  // NOTE: the portal renders only customer-appropriate data — intake, journey,
  // shared documents, and the knowledge base. Internal-only fields (notes,
  // @mentions, the activity timeline, and unshared attachments) are deliberately
  // never read here, so they cannot reach the customer.

  // Local copy of the checklist so the customer's checks reflect instantly; each
  // toggle also persists to the shared record (Supabase RPC, or the local store).
  const [checklist, setChecklist] = React.useState<ChecklistState>(customer.checklist ?? {});
  React.useEffect(() => {
    setChecklist(customer.checklist ?? {});
  }, [customer.id, customer.checklist]);

  const toggleStep = React.useCallback(
    (step: Step, done: boolean) => {
      setChecklist((prev) => ({
        ...prev,
        [step.id]: done
          ? { done: true, completedAt: new Date().toISOString(), completedBy: "Customer" }
          : { done: false },
      }));
      if (isSupabaseConfigured) {
        void togglePortalStep(customer.portalToken, step.id, done).catch(() => {
          // Revert on failure.
          setChecklist((prev) => ({ ...prev, [step.id]: customer.checklist?.[step.id] ?? { done: !done } }));
        });
      } else {
        store.toggleStep(customer.id, { id: step.id, title: step.title }, done, allStepIds);
      }
    },
    [customer.id, customer.portalToken, customer.checklist, store, allStepIds],
  );

  React.useEffect(() => {
    document.title = `${customer.name} · BuildVision Onboarding`;
  }, [customer.name]);

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Branded top bar */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2">
            <img src={asset("/brand/wordmark-on-light.png")} alt="BuildVision" className="h-5 w-auto dark:hidden" />
            <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="hidden h-5 w-auto dark:block" />
            <span className="ml-1 hidden text-sm text-muted-foreground sm:inline">Onboarding</span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6">
        {!submitted ? (
          <>
            {/* The form carries its own welcome heading + progress. */}
            <IntakeForm customer={customer} />

            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  What to expect
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <PortalJourney sections={facing} checklist={checklist} onToggle={toggleStep} />
            </div>
          </>
        ) : (
          <>
            {/* Welcome-back hero */}
            <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -top-px h-32 bg-gradient-to-b from-primary/[0.08] to-transparent"
              />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <CustomerAvatar name={customer.name} logoUrl={customer.logoUrl} size="lg" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Sparkles className="size-4" /> Welcome back
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{customer.name}</h1>
                  <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {statusMessage(customer)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="size-3.5" /> Your BuildVision contact:{" "}
                      <span className="text-foreground/80">{customer.assignedCsm}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" /> Status:{" "}
                      <span className="text-foreground/80">{labelForStatus(customer.status)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <PortalJourney sections={facing} checklist={checklist} onToggle={toggleStep} />

            <IntakeSummary customer={customer} />
          </>
        )}

        {/* Documents shared with the customer */}
        <PortalDocuments customer={customer} />

        {/* Knowledge base */}
        <section>
          <div className="mb-4 flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LifeBuoy className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Help &amp; guides</h2>
              <p className="text-sm text-muted-foreground">
                Self-serve guides, PDFs, and training to help you get the most out of BuildVision.
              </p>
            </div>
          </div>
          <KnowledgeBase articles={kb} layout="sidebar" />
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Questions? <a className="text-primary hover:underline" href="mailto:support@buildvision.io">support@buildvision.io</a>
      </footer>
    </div>
  );
}

/** Documents the internal team has explicitly shared with this customer. */
function PortalDocuments({ customer }: { customer: Customer }) {
  const docs = customer.attachments.filter((a) => a.sharedWithCustomer);
  if (docs.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderOpen className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Documents shared with you</h2>
          <p className="text-sm text-muted-foreground">
            Files and links from your BuildVision onboarding team.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {docs.map((a) => {
          const href = resolveDocHref(a.url);
          const isFile = a.kind === "file";
          const meta = [isFile ? "File" : "Link", formatBytes(a.size), formatDate(a.addedAt)]
            .filter(Boolean)
            .join(" · ");
          return (
            <a
              key={a.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...(isFile ? { download: a.name } : {})}
              className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {isFile ? <FileText className="size-4" /> : <Link2 className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold group-hover:text-primary">{a.name}</span>
                  <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
                </div>
                {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

/** A light, read-only recap of what the customer submitted. */
function IntakeSummary({ customer }: { customer: Customer }) {
  const i = customer.intake;
  const rows: { icon: React.ElementType; label: string; value?: string }[] = [
    { icon: Building2, label: "Organization", value: i.organizationName || i.companyName },
    { icon: User, label: "Primary contact", value: i.primaryContact },
    { icon: Sparkles, label: "Industry", value: i.industry },
    { icon: CalendarClock, label: "Requested go-live", value: i.requestedGoLiveDate ? formatDate(i.requestedGoLiveDate) : undefined },
  ].filter((r) => r.value);

  const teamCount = i.teamMembers?.length ?? 0;
  const officeCount = i.childOffices?.length ?? 0;

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Your submitted details</h2>
        {i.submittedAt && (
          <span className="text-xs text-muted-foreground">Submitted {formatDate(i.submittedAt)}</span>
        )}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2.5">
            <r.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{r.label}</dt>
              <dd className="truncate text-sm font-medium">{r.value}</dd>
            </div>
          </div>
        ))}
        {teamCount > 0 && (
          <div className="flex items-start gap-2.5">
            <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Team members to add</dt>
              <dd className="text-sm font-medium">{teamCount}</dd>
            </div>
          </div>
        )}
        {officeCount > 0 && (
          <div className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs text-muted-foreground">Additional offices</dt>
              <dd className="text-sm font-medium">{officeCount}</dd>
            </div>
          </div>
        )}
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">
        Need to change something?{" "}
        <a className="text-primary hover:underline" href={`mailto:support@buildvision.io?subject=${encodeURIComponent(`Update to ${customer.name} onboarding details`)}`}>
          Contact your onboarding team
        </a>
        .
      </p>
    </section>
  );
}

"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import type { AssociatedOrg, Customer, IntakeSurvey, TeamMember } from "@/lib/customer/types";
import { INTAKE_GROUPS, INTAKE_FIELDS, INTAKE_DEFAULTS, isFieldFilled, isFieldVisible, type IntakeField } from "@/lib/customer/intake-schema";
import { useCustomers } from "@/lib/customer/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OfficeList } from "./office-list";
import { TeamMemberList } from "./team-list";
import { MultiSelect } from "./multi-select";
import { AssociatedOrgList } from "./associated-org-list";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const draftKey = (id: string) => `bv.intakeDraft.${id}`;

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: IntakeField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const base = cn(
    "w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
    error ? "border-destructive" : "border-input",
  );
  return (
    <div className="flex flex-col gap-1.5">
      {field.label && (
        <label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="ml-0.5 text-destructive">*</span>}
        </label>
      )}
      {field.type === "textarea" ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
      ) : field.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(base, "h-10")}>
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type === "date" ? "date" : field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={cn("h-10", error && "border-destructive")}
        />
      )}
      {field.helper && !error && <p className="text-xs text-muted-foreground">{field.helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/** Optional custom copy shown on the success screen after submit. */
export interface SubmitNotice {
  title: string;
  body: string;
}

export function IntakeForm({
  customer,
  onSubmit,
  heading,
  subheading,
  submitLabel = "Submit intake",
}: {
  /** The customer being filled in. Omit for a blank "new customer" form. */
  customer?: Customer;
  /**
   * Custom submit handler (backend mode / sales intake). Falls back to the local
   * store when omitted. May return a {@link SubmitNotice} to customize the
   * success screen (e.g. the Sales Intake "created" vs "duplicate" message).
   */
  onSubmit?: (values: IntakeSurvey) => Promise<void | { notice?: SubmitNotice }>;
  /** Heading override (e.g. for the Sales Intake link). */
  heading?: string;
  subheading?: string;
  submitLabel?: string;
}) {
  const { updateIntake } = useCustomers();
  const dkey = draftKey(customer?.id ?? "sales-new");
  const [values, setValues] = React.useState<IntakeSurvey>(() => ({
    ...INTAKE_DEFAULTS,
    ...(customer?.intake ?? {}),
  }));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [notice, setNotice] = React.useState<SubmitNotice | null>(null);
  const [submitError, setSubmitError] = React.useState("");
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  // Load any autosaved draft on mount.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(dkey);
      if (raw) setValues((prev) => ({ ...prev, ...(JSON.parse(raw) as IntakeSurvey) }));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The primary contact is always the first user: mirror their name + email into
  // user #1, defaulting that user to Admin and not a bid-desk coordinator. Only
  // the name/email are synced — the role / bid-desk selects stay user-editable.
  React.useEffect(() => {
    setValues((prev) => {
      const users = [...((prev.teamMembers as TeamMember[]) ?? [])];
      const first = users[0] ?? { firstName: "", lastName: "", email: "", role: "Admin", bidDesk: "No" };
      const nextFirst: TeamMember = {
        ...first,
        firstName: prev.primaryContact ?? "",
        lastName: prev.contactLastName ?? "",
        email: prev.email ?? "",
        role: first.role ?? "Admin",
        bidDesk: first.bidDesk ?? "No",
      };
      // No change → skip the state update (avoids an extra render).
      if (
        users[0] &&
        users[0].firstName === nextFirst.firstName &&
        users[0].lastName === nextFirst.lastName &&
        users[0].email === nextFirst.email
      ) {
        return prev;
      }
      users[0] = nextFirst;
      return { ...prev, teamMembers: users };
    });
  }, [values.primaryContact, values.contactLastName, values.email]);

  function set(key: keyof IntakeSurvey, v: string | string[] | TeamMember[] | AssociatedOrg[]) {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      try {
        localStorage.setItem(dkey, JSON.stringify(next));
        setSavedAt(Date.now());
      } catch {
        /* ignore */
      }
      return next;
    });
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  // Only count / validate fields that are currently visible (respects showIf).
  const visibleFields = INTAKE_FIELDS.filter((f) => isFieldVisible(f, values));
  const requiredFields = visibleFields.filter((f) => f.required);
  const filledRequired = requiredFields.filter((f) => isFieldFilled(values[f.key])).length;
  const totalTracked = visibleFields.length;
  const filledAll = visibleFields.filter((f) => isFieldFilled(values[f.key])).length;
  const percent = totalTracked === 0 ? 0 : Math.round((filledAll / totalTracked) * 100);

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const f of requiredFields) {
      if (!isFieldFilled(values[f.key])) next[f.key] = "This field is required.";
    }
    if (isFieldFilled(values.email) && !EMAIL_RE.test(values.email as string)) {
      next.email = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      // Scroll to first error.
      const firstKey = Object.keys(errors)[0] ?? requiredFields.find((f) => !isFieldFilled(values[f.key]))?.key;
      if (firstKey) document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    (async () => {
      let result: void | { notice?: SubmitNotice } = undefined;
      try {
        if (onSubmit) result = await onSubmit(values);
        else if (customer) updateIntake(customer.id, values, { fromForm: true });
      } catch {
        setSubmitting(false);
        setSubmitError("Something went wrong submitting your intake. Please try again.");
        return;
      }
      try {
        localStorage.removeItem(dkey);
      } catch {
        /* ignore */
      }
      setSubmitting(false);
      setNotice(result?.notice ?? null);
      setSubmitted(true);
    })();
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">{notice?.title ?? "Thank you!"}</h1>
        <p className="mt-2 text-muted-foreground">
          {notice?.body ??
            "Your intake details have been sent to the BuildVision team. Your customer success team will be in touch to kick off your onboarding."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl">
      {/* Welcome heading — lives inside the form so it disappears on submit */}
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">
          {customer ? `Welcome${customer.name ? `, ${customer.name}` : ""}` : "BuildVision"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading ?? "Let's set up your BuildVision account"}
        </h1>
        {(() => {
          const sub =
            subheading ??
            "A few quick details help us configure everything before your kickoff. It takes about three minutes, and your answers save as you go.";
          return sub ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{sub}</p>
          ) : null;
        })()}
      </div>

      {/* progress */}
      <div className="sticky top-0 z-10 -mx-4 mb-8 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filledRequired}/{requiredFields.length} required complete
          </span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="space-y-10">
        {INTAKE_GROUPS.map((group) => (
          <section key={group.id}>
            {group.title && <h2 className="text-lg font-semibold tracking-tight">{group.title}</h2>}
            {group.description && <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.fields
                .filter((field) => isFieldVisible(field, values))
                .map((field) =>
                  field.type === "team" ? (
                    <div key={field.key} id={`field-${field.key}`} className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium">
                        {field.label}
                        {field.required && <span className="ml-0.5 text-destructive">*</span>}
                      </label>
                      <TeamMemberList
                        value={(values[field.key] as TeamMember[]) ?? []}
                        onChange={(arr) => set(field.key, arr)}
                      />
                      {field.helper && <p className="mt-1.5 text-xs text-muted-foreground">{field.helper}</p>}
                      {errors[field.key] && <p className="mt-1.5 text-xs text-destructive">{errors[field.key]}</p>}
                    </div>
                  ) : field.type === "assocOrgs" ? (
                    <div key={field.key} id={`field-${field.key}`} className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium">
                        {field.label}
                        {field.required && <span className="ml-0.5 text-destructive">*</span>}
                      </label>
                      <AssociatedOrgList
                        value={(values[field.key] as AssociatedOrg[]) ?? []}
                        onChange={(arr) => set(field.key, arr)}
                      />
                      {field.helper && <p className="mt-1.5 text-xs text-muted-foreground">{field.helper}</p>}
                      {errors[field.key] && <p className="mt-1.5 text-xs text-destructive">{errors[field.key]}</p>}
                    </div>
                  ) : field.type === "multiselect" ? (
                    <div key={field.key} id={`field-${field.key}`} className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium">
                        {field.label}
                        {field.required && <span className="ml-0.5 text-destructive">*</span>}
                      </label>
                      <MultiSelect
                        options={field.options ?? []}
                        value={(values[field.key] as string[]) ?? []}
                        onChange={(arr) => set(field.key, arr)}
                      />
                      {field.helper && <p className="mt-1.5 text-xs text-muted-foreground">{field.helper}</p>}
                      {errors[field.key] && <p className="mt-1.5 text-xs text-destructive">{errors[field.key]}</p>}
                    </div>
                  ) : field.type === "list" ? (
                    <div key={field.key} id={`field-${field.key}`} className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium">
                        {field.label}
                        {field.required && <span className="ml-0.5 text-destructive">*</span>}
                      </label>
                      <OfficeList
                        value={(values[field.key] as string[]) ?? []}
                        onChange={(arr) => set(field.key, arr)}
                        placeholder={field.placeholder}
                      />
                      {field.helper && <p className="mt-1.5 text-xs text-muted-foreground">{field.helper}</p>}
                      {errors[field.key] && <p className="mt-1.5 text-xs text-destructive">{errors[field.key]}</p>}
                    </div>
                  ) : (
                    <div key={field.key} id={`field-${field.key}`} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <Field
                        field={field}
                        value={(values[field.key] as string) ?? ""}
                        error={errors[field.key]}
                        onChange={(v) => set(field.key, v)}
                      />
                    </div>
                  ),
                )}
            </div>
          </section>
        ))}
      </div>

      {submitError && (
        <p className="mt-6 text-center text-sm text-destructive sm:text-right">{submitError}</p>
      )}

      <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          {savedAt ? "Draft saved automatically" : "Your progress saves automatically as you type."}
        </p>
        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitting ? "Submitting…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

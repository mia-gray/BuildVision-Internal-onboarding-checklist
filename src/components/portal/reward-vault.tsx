"use client";

/* eslint-disable @next/next/no-img-element -- static export product shots, plain <img> */

import * as React from "react";
import {
  Lock,
  Gift,
  Check,
  Sparkles,
  Truck,
  Mail,
  Loader2,
  PartyPopper,
} from "lucide-react";

import type { RewardChoice, RewardClaim } from "@/lib/customer/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { claimRewardPublic } from "@/lib/customer/public-access";
import { useCustomers } from "@/lib/customer/store";
import { burstConfetti } from "@/lib/confetti";
import { asset, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REWARDS: {
  choice: RewardChoice;
  title: string;
  description: string;
  img: string;
  kind: "physical" | "digital";
}[] = [
  {
    choice: "hat",
    title: "BuildVision Hat",
    description: "Premium embroidered cap in signature tan + lilac.",
    img: "/rewards/hat.png",
    kind: "physical",
  },
  {
    choice: "tumbler",
    title: "BuildVision Tumbler",
    description: "Insulated stainless tumbler, laser-etched with the mark.",
    img: "/rewards/tumbler.png",
    kind: "physical",
  },
  {
    choice: "doordash",
    title: "$15 DoorDash Gift Card",
    description: "Lunch on us — delivered straight to your inbox.",
    img: "/rewards/doordash.png",
    kind: "digital",
  },
];

function encourage(percent: number): string {
  if (percent === 0) return "Complete your onboarding to unlock your reward.";
  if (percent < 34) return "Great start — keep going to unlock your gift.";
  if (percent < 67) return "You're making real progress. Your reward is waiting.";
  if (percent < 100) return "Almost there — just a few tasks left to unlock it!";
  return "Unlocked!";
}

interface FormState {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}
const EMPTY_FORM: FormState = { name: "", address: "", city: "", state: "", zip: "", phone: "", email: "" };

export function RewardVault({
  done,
  total,
  reward,
  portalToken,
  customerId,
}: {
  done: number;
  total: number;
  reward?: RewardClaim;
  portalToken: string;
  customerId: string;
}) {
  const store = useCustomers();
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const unlocked = total > 0 && done >= total;

  const [claimed, setClaimed] = React.useState<RewardClaim | null>(reward ?? null);
  const [selected, setSelected] = React.useState<RewardChoice | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setClaimed(reward ?? null);
  }, [reward, customerId]);

  // Celebrate the moment the last task is completed.
  const prevUnlocked = React.useRef(unlocked);
  React.useEffect(() => {
    if (unlocked && !prevUnlocked.current && !claimed) burstConfetti();
    prevUnlocked.current = unlocked;
  }, [unlocked, claimed]);

  const chosen = REWARDS.find((r) => r.choice === selected);

  function set<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  function valid(): boolean {
    if (!chosen) return false;
    if (chosen.kind === "digital") return EMAIL_RE.test(form.email.trim());
    return Boolean(form.name.trim() && form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim());
  }

  async function claim() {
    if (!chosen || !valid()) {
      setError("Please fill in the required fields.");
      return;
    }
    const claim: RewardClaim =
      chosen.kind === "digital"
        ? { choice: chosen.choice, email: form.email.trim(), submittedAt: new Date().toISOString() }
        : {
            choice: chosen.choice,
            name: form.name.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            zip: form.zip.trim(),
            phone: form.phone.trim() || undefined,
            submittedAt: new Date().toISOString(),
          };
    setSubmitting(true);
    setError("");
    try {
      if (isSupabaseConfigured) await claimRewardPublic(portalToken, claim);
      else store.claimReward(customerId, claim);
    } catch {
      setSubmitting(false);
      setError("Something went wrong claiming your reward. Please try again.");
      return;
    }
    setSubmitting(false);
    setClaimed(claim);
    burstConfetti();
  }

  // ---- CLAIMED ----------------------------------------------------------
  if (claimed) {
    const r = REWARDS.find((x) => x.choice === claimed.choice)!;
    return (
      <section aria-labelledby="reward-heading" className="scroll-mt-20">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--success)]/30 bg-gradient-to-b from-[color-mix(in_oklch,var(--success)_10%,transparent)] to-card p-6 text-center sm:p-8">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--success)] text-[var(--success-foreground)] shadow-lg">
            <Check className="size-7" strokeWidth={3} />
          </span>
          <h2 id="reward-heading" className="text-xl font-semibold tracking-tight">
            Your reward is on the way 🎉
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            You claimed the <span className="font-medium text-foreground">{r.title}</span>. Your BuildVision
            customer success team has been notified and will take it from here.
          </p>
          <div className="mx-auto mt-5 flex max-w-sm items-center gap-4 rounded-xl border border-border bg-card p-4 text-left">
            <img src={asset(r.img)} alt={r.title} className="size-16 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0 text-sm">
              <p className="font-medium">{r.title}</p>
              <p className="mt-0.5 text-muted-foreground">
                {claimed.choice === "doordash"
                  ? `Sending to ${claimed.email}`
                  : `Shipping to ${claimed.name}, ${claimed.city} ${claimed.state}`}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ---- UNLOCKED (choose reward) ----------------------------------------
  if (unlocked) {
    return (
      <section aria-labelledby="reward-heading" className="scroll-mt-20">
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[0.07] to-card p-6 sm:p-8">
          <div className="text-center">
            <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6E56CF] to-[var(--primary)] text-white shadow-lg animate-[unlockpop_.5s_ease-out]">
              <PartyPopper className="size-7" />
            </span>
            <p aria-live="polite" className="text-sm font-medium text-primary">
              <Sparkles className="mr-1 inline size-4" /> Congratulations!
            </p>
            <h2 id="reward-heading" className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              You&apos;ve unlocked your BuildVision Welcome Gift
            </h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              You completed every onboarding task. Choose <span className="font-medium text-foreground">one</span> reward
              below to claim.
            </p>
          </div>

          {/* Reward choices */}
          <div role="radiogroup" aria-label="Choose your reward" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {REWARDS.map((r) => {
              const active = selected === r.choice;
              return (
                <button
                  key={r.choice}
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSelected(r.choice);
                    setError("");
                  }}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "border-primary ring-2 ring-primary/40 shadow-lg" : "border-border",
                  )}
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                    <img
                      src={asset(r.img)}
                      alt={r.title}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                    {active && (
                      <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="mt-1 flex-1 text-xs text-muted-foreground">{r.description}</p>
                    <span
                      className={cn(
                        "mt-3 inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      )}
                    >
                      {active ? (<><Check className="size-3.5" /> Selected</>) : "Select"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional fulfillment form */}
          {chosen && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5 animate-[fadein_.3s_ease-out]">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {chosen.kind === "digital" ? <Mail className="size-4 text-primary" /> : <Truck className="size-4 text-primary" />}
                {chosen.kind === "digital" ? "Where should we send it?" : "Where should we ship it?"}
              </p>
              {chosen.kind === "digital" ? (
                <div className="mt-3">
                  <label htmlFor="rw-email" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Email address <span className="text-destructive">*</span>
                  </label>
                  <Input id="rw-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" className="h-10 sm:max-w-sm" />
                  <p className="mt-1.5 text-xs text-muted-foreground">Your $15 DoorDash gift card arrives by email.</p>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field id="rw-name" label="Name" req value={form.name} onChange={(v) => set("name", v)} className="sm:col-span-2" />
                  <Field id="rw-address" label="Shipping address" req value={form.address} onChange={(v) => set("address", v)} className="sm:col-span-2" />
                  <Field id="rw-city" label="City" req value={form.city} onChange={(v) => set("city", v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="rw-state" label="State" req value={form.state} onChange={(v) => set("state", v)} />
                    <Field id="rw-zip" label="Zip code" req value={form.zip} onChange={(v) => set("zip", v)} />
                  </div>
                  <Field id="rw-phone" label="Phone (optional)" value={form.phone} onChange={(v) => set("phone", v)} className="sm:col-span-2" />
                </div>
              )}

              {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

              <div className="mt-4 flex items-center justify-end">
                <Button size="lg" onClick={claim} disabled={submitting || !valid()}>
                  {submitting ? <Loader2 className="animate-spin" /> : <Gift />}
                  {submitting ? "Claiming…" : "Claim my reward"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ---- LOCKED -----------------------------------------------------------
  const remaining = Math.max(0, total - done);
  return (
    <section aria-labelledby="reward-heading" className="scroll-mt-20">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
        {/* soft brand glow */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6E56CF] to-[var(--primary)] text-white shadow-lg">
            <Lock className="size-6" />
          </span>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 id="reward-heading" className="text-lg font-semibold tracking-tight">
              🔒 Your BuildVision Welcome Gift
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Finish every onboarding task to unlock your free BuildVision Welcome Gift.
            </p>
          </div>
        </div>

        {/* Blurred peek at the rewards */}
        <div className="relative mt-6">
          <div className="grid grid-cols-3 gap-3" aria-hidden>
            {REWARDS.map((r) => (
              <div key={r.choice} className="aspect-[3/2] overflow-hidden rounded-xl border border-border bg-muted">
                <img src={asset(r.img)} alt="" className="size-full scale-105 object-cover opacity-60 blur-[3px]" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              Hat · Tumbler · $15 DoorDash — pick one when you finish
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{encourage(percent)}</span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {done}/{total} · {percent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding completion toward reward"
            className="h-2.5 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6E56CF] to-[var(--primary)] transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          {remaining > 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground sm:text-left">
              {remaining} {remaining === 1 ? "task" : "tasks"} to go until your reward unlocks.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  req,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  req?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label} {req && <span className="text-destructive">*</span>}
      </label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-10" />
    </div>
  );
}

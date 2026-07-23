"use client";

/* eslint-disable @next/next/no-img-element -- static export product shots, plain <img> */

import { Gift, Truck, Mail } from "lucide-react";

import type { Customer } from "@/lib/customer/types";
import { REWARD_LABELS } from "@/lib/customer/service";
import { asset } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const IMG: Record<string, string> = {
  hat: "/rewards/hat.png",
  tumbler: "/rewards/tumbler.png",
  doordash: "/rewards/doordash.png",
};

/** Shown on the customer workspace when the customer has claimed their reward. */
export function CustomerReward({ customer }: { customer: Customer }) {
  const r = customer.reward;
  if (!r) return null;
  const physical = r.choice !== "doordash";

  return (
    <section aria-labelledby="reward-heading">
      <div className="mb-3 flex items-center gap-2">
        <Gift className="size-4 text-primary" />
        <h2 id="reward-heading" className="text-sm font-semibold">
          Reward to fulfill
        </h2>
      </div>
      <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4">
        <div className="flex items-start gap-3">
          <img src={asset(IMG[r.choice])} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{REWARD_LABELS[r.choice]}</p>
            <p className="text-xs text-muted-foreground">Claimed {formatDate(r.submittedAt)}</p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm">
          {physical ? (
            <div className="space-y-0.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Truck className="size-3.5" /> Ship to
              </p>
              <p className="font-medium">{r.name}</p>
              <p className="text-muted-foreground">{r.address}</p>
              <p className="text-muted-foreground">
                {r.city}, {r.state} {r.zip}
              </p>
              {r.phone && <p className="text-muted-foreground">{r.phone}</p>}
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="size-3.5" /> Send gift card to
              </p>
              <a href={`mailto:${r.email}`} className="font-medium text-primary hover:underline">
                {r.email}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

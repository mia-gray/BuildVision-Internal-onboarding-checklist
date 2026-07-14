"use client";

/**
 * Data access for the customer-facing pages (portal + intake).
 *
 * In backend mode these run as anonymous visitors, so they cannot read the
 * customer table directly — they call the token-scoped RPC functions
 * (portal_get / intake_get / intake_submit), which return only the one relevant
 * (and, for the portal, sanitized) record.
 *
 * In localStorage mode they fall back to the in-browser store, exactly as
 * before.
 */
import * as React from "react";

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useCustomers } from "./store";
import type { Customer, IntakeSurvey } from "./types";

/** Build a full Customer from a sanitized RPC payload (missing fields default). */
function hydrate(d: Record<string, unknown>): Customer {
  return {
    id: String(d.id ?? ""),
    name: String(d.name ?? ""),
    companyName: String(d.companyName ?? ""),
    logoUrl: (d.logoUrl as string) ?? undefined,
    assignedCsm: String(d.assignedCsm ?? ""),
    portalToken: "",
    status: (d.status as Customer["status"]) ?? "not_started",
    intake: (d.intake as IntakeSurvey) ?? {},
    intakeSubmitted: Boolean(d.intakeSubmitted),
    checklist: (d.checklist as Customer["checklist"]) ?? {},
    notes: [],
    timeline: [],
    attachments: (d.attachments as Customer["attachments"]) ?? [],
    archived: false,
    createdAt: String(d.createdAt ?? ""),
    updatedAt: String(d.updatedAt ?? ""),
  };
}

interface PublicResult {
  customer: Customer | null;
  loading: boolean;
}

/** Resolve the portal's customer from a portal token. */
export function usePortalCustomer(token: string): PublicResult {
  const store = useCustomers();
  const [remote, setRemote] = React.useState<PublicResult>({ customer: null, loading: true });

  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    if (!token) {
      setRemote({ customer: null, loading: false });
      return;
    }
    setRemote({ customer: null, loading: true });
    supabase.rpc("portal_get", { p_token: token }).then(({ data, error }) => {
      if (!active) return;
      setRemote({ customer: error || !data ? null : hydrate(data as Record<string, unknown>), loading: false });
    });
    return () => {
      active = false;
    };
  }, [token]);

  if (isSupabaseConfigured) return remote;
  return {
    customer: token ? (store.customers.find((c) => c.portalToken === token) ?? null) : null,
    loading: store.loading,
  };
}

/** Resolve the intake form's customer from a customer id. */
export function useIntakeCustomer(id: string): PublicResult {
  const store = useCustomers();
  const [remote, setRemote] = React.useState<PublicResult>({ customer: null, loading: true });

  React.useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    if (!id) {
      setRemote({ customer: null, loading: false });
      return;
    }
    setRemote({ customer: null, loading: true });
    supabase.rpc("intake_get", { p_id: id }).then(({ data, error }) => {
      if (!active) return;
      setRemote({ customer: error || !data ? null : hydrate(data as Record<string, unknown>), loading: false });
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (isSupabaseConfigured) return remote;
  return { customer: id ? (store.getCustomer(id) ?? null) : null, loading: store.loading };
}

/** Submit intake answers for the public form. Returns an error message or null. */
export async function submitIntakePublic(id: string, intake: IntakeSurvey): Promise<string | null> {
  if (!supabase) return "Backend is not configured.";
  const { error } = await supabase.rpc("intake_submit", { p_id: id, p_intake: intake });
  return error ? error.message : null;
}

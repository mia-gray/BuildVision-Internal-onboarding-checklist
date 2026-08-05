"use client";

import * as React from "react";
import { UploadCloud, Loader2, Check, X } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth";
import { useCustomers, IMPORT_DISMISSED_KEY } from "@/lib/customer/store";
import { CUSTOMERS_STORAGE_KEY } from "@/lib/customer/repository";
import { SEED_CUSTOMER_IDS } from "@/lib/customer/seed";
import type { Customer } from "@/lib/customer/types";
import { Button } from "@/components/ui/button";

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(IMPORT_DISMISSED_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

/**
 * Shown only in backend mode when this browser holds customers that aren't in
 * the shared database yet (e.g. created before the backend was turned on). One
 * click pushes them to Supabase; Dismiss silences it for this browser (e.g. for
 * a stale/deleted local-only record you don't want re-imported).
 */
export function LocalImportBanner() {
  const { required, userId } = useAuth();
  const { customers, loading, importLocalCustomers } = useCustomers();
  const [pending, setPending] = React.useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState<number | null>(null);

  const backendIds = React.useMemo(() => new Set(customers.map((c) => c.id)), [customers]);

  React.useEffect(() => {
    if (!isSupabaseConfigured || !required || !userId || loading) {
      setPending([]);
      return;
    }
    try {
      const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      const local = (raw ? (JSON.parse(raw) as Customer[]) : []) ?? [];
      const dismissed = readDismissed();
      const rows = local
        .filter(
          (c) =>
            c &&
            c.id &&
            !SEED_CUSTOMER_IDS.includes(c.id) &&
            !backendIds.has(c.id) &&
            !dismissed.has(c.id),
        )
        .map((c) => ({ id: c.id, name: c.name || "(unnamed)" }));
      setPending(rows);
    } catch {
      setPending([]);
    }
  }, [required, userId, loading, backendIds]);

  async function runImport() {
    setBusy(true);
    const { imported } = await importLocalCustomers();
    setBusy(false);
    setImportedCount(imported);
    setPending([]);
  }

  function dismiss() {
    try {
      const next = new Set([...readDismissed(), ...pending.map((p) => p.id)]);
      localStorage.setItem(IMPORT_DISMISSED_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
    setPending([]);
  }

  if (importedCount !== null) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[color-mix(in_oklch,var(--success)_8%,transparent)] px-4 py-3 text-sm">
        <Check className="size-4 text-[var(--success)]" />
        <span>
          Imported <strong>{importedCount}</strong> customer{importedCount === 1 ? "" : "s"} into the
          shared database. Your team can see {importedCount === 1 ? "it" : "them"} now.
        </span>
      </div>
    );
  }

  if (pending.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center">
      <UploadCloud className="size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {pending.length} customer{pending.length === 1 ? "" : "s"} saved only in this browser
        </p>
        <p className="text-xs text-muted-foreground">
          {pending.slice(0, 6).map((p) => p.name).join(", ")}
          {pending.length > 6 ? `, +${pending.length - 6} more` : ""} — not in the shared database
          yet, so teammates and client links can&apos;t see {pending.length === 1 ? "it" : "them"}.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={runImport} disabled={busy} size="sm">
          {busy ? <Loader2 className="animate-spin" /> : <UploadCloud />}
          {busy ? "Importing…" : "Import to shared database"}
        </Button>
        <Button
          onClick={dismiss}
          disabled={busy}
          variant="ghost"
          size="sm"
          title="Hide this — won't import or re-add these records on this browser"
        >
          <X /> Dismiss
        </Button>
      </div>
    </div>
  );
}

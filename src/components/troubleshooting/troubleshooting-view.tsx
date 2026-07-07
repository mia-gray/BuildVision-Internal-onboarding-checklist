"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CircleAlert } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OwnerBadges } from "@/components/content-badges";
import { cn } from "@/lib/utils";
import type { TroubleshootingItem } from "@/lib/types";

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function SeverityBadge({ severity }: { severity?: TroubleshootingItem["severity"] }) {
  if (!severity) return null;
  const variant = severity === "high" ? "destructive" : severity === "medium" ? "warning" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {severity}
    </Badge>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export function TroubleshootingView() {
  const { troubleshooting } = useCatalog();
  const [query, setQuery] = React.useState("");
  const [severity, setSeverity] = React.useState("All");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return troubleshooting
      .filter((t) => {
        const matchesSev = severity === "All" || t.severity === severity.toLowerCase();
        const matchesQ =
          !q ||
          t.problem.toLowerCase().includes(q) ||
          t.cause.toLowerCase().includes(q) ||
          t.resolution.toLowerCase().includes(q);
        return matchesSev && matchesQ;
      })
      .sort(
        (a, b) => (SEVERITY_ORDER[a.severity ?? "low"] ?? 3) - (SEVERITY_ORDER[b.severity ?? "low"] ?? 3),
      );
  }, [troubleshooting, query, severity]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 no-print">
          {["All", "High", "Medium", "Low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverity(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                severity === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No matching issues.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <article
              key={t.id}
              id={t.id}
              className="scroll-mt-20 rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="flex items-start gap-2 text-sm font-semibold">
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {t.problem}
                </h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  <SeverityBadge severity={t.severity} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Possible cause">{t.cause}</Field>
                <Field label="Resolution">{t.resolution}</Field>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Owner
                  </span>
                  {t.owner ? <OwnerBadges owners={[t.owner]} /> : <span className="text-xs">—</span>}
                </div>
                {t.relatedSteps?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {t.relatedSteps.map((r) => (
                      <Link
                        key={r.href + r.label}
                        href={r.href}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground/80 transition-colors hover:bg-accent"
                      >
                        {r.label}
                        <ArrowUpRight className="size-3" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

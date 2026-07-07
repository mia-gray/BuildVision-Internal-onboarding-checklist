import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";

import { getGaps } from "@/lib/content";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import type { ProcessGap } from "@/lib/types";

export const metadata: Metadata = {
  title: "Process Gaps",
  description: "Documentation gaps flagged from the source, with suggested fixes.",
};

const CATEGORY_ORDER: ProcessGap["category"][] = [
  "Referenced but incomplete",
  "Undefined internal procedure",
  "Operational gap",
];

function ImpactBadge({ impact }: { impact?: ProcessGap["impact"] }) {
  if (!impact) return null;
  const variant = impact === "high" ? "destructive" : impact === "medium" ? "warning" : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {impact} impact
    </Badge>
  );
}

export default function ProcessGapsPage() {
  const gaps = getGaps();
  const grouped = gaps.reduce<Record<string, ProcessGap[]>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});
  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

  const highCount = gaps.filter((g) => g.impact === "high").length;

  return (
    <div className="space-y-8">
      <PageHeader
        icon="AlertTriangle"
        title="Process Gaps & Improvements"
        description="Where the source material is incomplete or silent. Each item is flagged with its impact and a concrete suggestion so onboarding can be run with zero guesswork over time."
      />

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 text-sm">
        <span className="font-mono text-lg font-semibold">{gaps.length}</span>
        <span className="text-muted-foreground">gaps documented</span>
        <span className="h-4 w-px bg-border" />
        <span className="font-mono text-lg font-semibold text-destructive">{highCount}</span>
        <span className="text-muted-foreground">high impact</span>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{cat}</h2>
          <div className="space-y-3">
            {grouped[cat].map((g) => (
              <article
                key={g.id}
                id={g.id}
                className="scroll-mt-20 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-baseline gap-2 text-sm font-semibold">
                    <span className="font-mono text-xs text-muted-foreground">{g.code}</span>
                    {g.title}
                  </h3>
                  <ImpactBadge impact={g.impact} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{g.detail}</p>
                {g.suggestion && (
                  <div className="mt-3 flex gap-2.5 rounded-lg border border-[color-mix(in_oklch,var(--info)_25%,transparent)] bg-[color-mix(in_oklch,var(--info)_7%,transparent)] p-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-[var(--info)]" />
                    <p className="text-sm text-foreground/90">
                      <span className="font-medium">Suggested fix: </span>
                      {g.suggestion}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

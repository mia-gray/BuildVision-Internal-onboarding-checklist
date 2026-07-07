"use client";

import { useCatalog } from "@/components/providers/catalog-provider";
import { CopyButton } from "@/components/copy-button";

/** Copy-to-clipboard chips for text CS/OPS paste all the time. */
export function Snippets() {
  const { meta } = useCatalog();
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold">Copy snippets</h3>
        <p className="text-xs text-muted-foreground">One-click copy for common text.</p>
      </div>
      <ul className="divide-y divide-border">
        {meta.snippets.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="truncate font-mono text-xs text-foreground/90">{s.value}</p>
            </div>
            <CopyButton value={s.value} variant="outline" size="sm" label="Copy" />
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import type { Customer } from "@/lib/customer/types";
import { formatDateTime } from "@/lib/format";
import { timelineIcon } from "@/lib/customer/timeline-icons";

export function CustomerTimeline({ customer }: { customer: Customer }) {
  const events = customer.timeline;
  return (
    <section aria-labelledby="timeline-heading">
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <h2 id="timeline-heading" className="text-sm font-semibold">
            Activity timeline
          </h2>
        </div>
        {events.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative p-4">
            <span aria-hidden className="absolute bottom-6 left-[27px] top-8 w-px bg-border" />
            {events.map((e) => {
              const Icon = timelineIcon(e.type);
              const highlight = e.type === "checklist_finished" || e.type === "intake_submitted";
              return (
                <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                  <span
                    className={
                      "relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border " +
                      (highlight
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground")
                    }
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm text-foreground/90">{e.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(e.at)}
                      {e.by ? ` · ${e.by}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}

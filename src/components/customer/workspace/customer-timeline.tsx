"use client";

import {
  UserPlus,
  Send,
  Inbox,
  Flag,
  CheckCircle2,
  MessageSquare,
  PencilLine,
  PartyPopper,
  Paperclip,
  Eye,
  Circle,
} from "lucide-react";

import type { Customer, TimelineEventType } from "@/lib/customer/types";
import { formatDateTime } from "@/lib/format";

const ICON: Record<TimelineEventType, typeof Circle> = {
  customer_created: UserPlus,
  intake_sent: Send,
  intake_submitted: Inbox,
  intake_updated: PencilLine,
  status_changed: Flag,
  task_completed: CheckCircle2,
  section_completed: CheckCircle2,
  note_added: MessageSquare,
  checklist_finished: PartyPopper,
  document_added: Paperclip,
  document_shared: Eye,
};

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
              const Icon = ICON[e.type] ?? Circle;
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

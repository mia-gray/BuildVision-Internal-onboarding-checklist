"use client";

import * as React from "react";
import { MessageSquare, Trash2, Send } from "lucide-react";

import type { Customer, NoteCategory } from "@/lib/customer/types";
import { useCustomers } from "@/lib/customer/store";
import { formatRelative, initials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: NoteCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "meeting", label: "Meeting" },
  { value: "update", label: "Update" },
  { value: "request", label: "Request" },
  { value: "follow_up", label: "Follow-up" },
  { value: "blocker", label: "Blocker" },
];

const CATEGORY_TONE: Record<NoteCategory, string> = {
  general: "bg-muted text-muted-foreground",
  meeting: "bg-primary/10 text-primary",
  update: "bg-[color-mix(in_oklch,var(--info)_16%,transparent)] text-[var(--info)]",
  request: "bg-accent text-accent-foreground",
  follow_up: "bg-[color-mix(in_oklch,var(--warning)_22%,transparent)] text-[var(--warning-foreground)] dark:text-[var(--warning)]",
  blocker: "bg-destructive/10 text-destructive",
};

export function CustomerNotes({ customer }: { customer: Customer }) {
  const { addNote, removeNote } = useCustomers();
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState<NoteCategory>("general");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addNote(customer.id, body, category);
    setBody("");
    setCategory("general");
  }

  return (
    <section aria-labelledby="notes-heading" className="scroll-mt-20" id="notes">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <h2 id="notes-heading" className="text-sm font-semibold">
          Internal notes
        </h2>
        <span className="text-xs text-muted-foreground">({customer.notes.length})</span>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <form onSubmit={submit} className="border-b border-border p-4 no-print">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Log a meeting note, update, request, follow-up, or blocker…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2 flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={!body.trim()} className="ml-auto">
              <Send /> Add note
            </Button>
          </div>
        </form>

        {customer.notes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notes yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {customer.notes.map((note) => (
              <li key={note.id} className="group flex gap-3 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-secondary-foreground">
                  {initials(note.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{note.author}</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize",
                        CATEGORY_TONE[note.category],
                      )}
                    >
                      {note.category.replace("_", "-")}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatRelative(note.createdAt)}</span>
                    <button
                      onClick={() => removeNote(customer.id, note.id)}
                      className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 no-print"
                      aria-label="Delete note"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{note.body}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

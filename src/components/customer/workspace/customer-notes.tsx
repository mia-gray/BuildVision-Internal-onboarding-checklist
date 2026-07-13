"use client";

import * as React from "react";
import { MessageSquare, Trash2, Send, Lock, AtSign, Bell } from "lucide-react";

import type { Customer, NoteCategory } from "@/lib/customer/types";
import { useCustomers } from "@/lib/customer/store";
import { TEAM_ROSTER, parseMentions } from "@/lib/customer/mentions";
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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Render a note body with @mentions highlighted. */
function NoteBody({ body, mentions }: { body: string; mentions?: string[] }) {
  if (!mentions || mentions.length === 0) {
    return <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{body}</p>;
  }
  const re = new RegExp(`(@(?:${mentions.map(escapeRegExp).join("|")}))(?![A-Za-z])`, "g");
  const parts = body.split(re);
  return (
    <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="rounded bg-primary/10 px-1 font-medium text-primary">
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </p>
  );
}

export function CustomerNotes({ customer }: { customer: Customer }) {
  const { addNote, removeNote, currentUser } = useCustomers();
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState<NoteCategory>("general");
  const [caret, setCaret] = React.useState(0);
  const [mentionQuery, setMentionQuery] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const roster = React.useMemo(() => TEAM_ROSTER.filter((n) => n !== currentUser), [currentUser]);
  const suggestions =
    mentionQuery === null
      ? []
      : roster.filter((n) => n.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5);

  const liveMentions = parseMentions(body, TEAM_ROSTER);

  function onBodyChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    const pos = e.target.selectionStart ?? v.length;
    setBody(v);
    setCaret(pos);
    const before = v.slice(0, pos);
    const m = before.match(/@([\w]*)$/);
    setMentionQuery(m ? m[1] : null);
  }

  function insertMention(name: string) {
    const before = body.slice(0, caret).replace(/@([\w]*)$/, `@${name} `);
    const after = body.slice(caret);
    const next = before + after;
    setBody(next);
    setMentionQuery(null);
    // Restore focus + place caret right after the inserted mention.
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.selectionStart = el.selectionEnd = before.length;
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addNote(customer.id, body, category, parseMentions(body, TEAM_ROSTER));
    setBody("");
    setCategory("general");
    setMentionQuery(null);
  }

  return (
    <section aria-labelledby="notes-heading" className="scroll-mt-20" id="notes">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <h2 id="notes-heading" className="text-sm font-semibold">
          Internal notes
        </h2>
        <span className="text-xs text-muted-foreground">({customer.notes.length})</span>
        <span
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          title="Only your team can see this. Notes and @mentions are never shown to the customer in their portal."
        >
          <Lock className="size-3" /> Internal only
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <form onSubmit={submit} className="relative border-b border-border p-4 no-print">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={onBodyChange}
            onKeyUp={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
            onClick={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
            onBlur={() => setTimeout(() => setMentionQuery(null), 120)}
            rows={2}
            placeholder="Log a note for your team. Type @ to mention a teammate…"
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />

          {/* @mention autocomplete */}
          {mentionQuery !== null && suggestions.length > 0 && (
            <ul className="absolute left-4 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
              {suggestions.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertMention(name);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-semibold text-secondary-foreground">
                      {initials(name)}
                    </span>
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}

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
            {liveMentions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <AtSign className="size-3" />
                {liveMentions.join(", ")}
              </span>
            )}
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
                  <NoteBody body={note.body} mentions={note.mentions} />
                  {note.mentions && note.mentions.length > 0 && (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Bell className="size-3" /> Notified {note.mentions.join(", ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

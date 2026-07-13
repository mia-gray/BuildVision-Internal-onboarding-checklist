"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import type { TimelineEventType } from "@/lib/customer/types";
import { useCustomers } from "@/lib/customer/store";
import { customerPath } from "@/lib/customer/paths";
import { timelineIcon } from "@/lib/customer/timeline-icons";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const SEEN_KEY = "bv.notifSeenAt.v1";
const MAX_ITEMS = 40;

/** Event types worth surfacing in the cross-customer feed (skips low-signal edits). */
const NOTIFY_TYPES = new Set<TimelineEventType>([
  "customer_created",
  "intake_submitted",
  "status_changed",
  "task_completed",
  "checklist_finished",
  "note_added",
  "document_added",
  "document_shared",
]);

interface Notification {
  id: string;
  type: TimelineEventType;
  label: string;
  detail?: string;
  at: string;
  by?: string;
  customerId: string;
  customerName: string;
}

export function NotificationsBell() {
  const { customers, loading } = useCustomers();
  const [open, setOpen] = React.useState(false);
  const [seenAt, setSeenAt] = React.useState<string>("");
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Load + cross-tab sync of the "seen" watermark.
  React.useEffect(() => {
    setSeenAt(localStorage.getItem(SEEN_KEY) ?? "");
    function onStorage(e: StorageEvent) {
      if (e.key === SEEN_KEY) setSeenAt(localStorage.getItem(SEEN_KEY) ?? "");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close on outside click / Escape.
  React.useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const notifications = React.useMemo<Notification[]>(() => {
    return customers
      .filter((c) => !c.archived)
      .flatMap((c) =>
        c.timeline
          .filter((e) => NOTIFY_TYPES.has(e.type))
          .map((e) => ({
            id: `${c.id}:${e.id}`,
            type: e.type,
            label: e.label,
            detail: e.detail,
            at: e.at,
            by: e.by,
            customerId: c.id,
            customerName: c.name,
          })),
      )
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, MAX_ITEMS);
  }, [customers]);

  const unreadCount = notifications.filter((n) => !seenAt || n.at > seenAt).length;

  function markAllRead() {
    const newest = notifications[0]?.at ?? new Date().toISOString();
    localStorage.setItem(SEEN_KEY, newest);
    setSeenAt(newest);
  }

  if (loading) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Bell className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-border overflow-y-auto">
              {notifications.map((n) => {
                const Icon = timelineIcon(n.type);
                const unread = !seenAt || n.at > seenAt;
                return (
                  <li key={n.id}>
                    <Link
                      href={customerPath(n.customerId)}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
                        unread && "bg-primary/[0.04]",
                      )}
                    >
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{n.customerName}</span>{" "}
                          <span className="text-muted-foreground">— {n.label}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[n.by, formatRelative(n.at)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

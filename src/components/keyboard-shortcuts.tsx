"use client";

/**
 * Global keyboard shortcuts + a "?" help dialog.
 *
 * - Cmd/Ctrl+K ....... command palette (handled in command-palette.tsx)
 * - g then d ......... dashboard
 * - g then f ......... FAQ
 * - g then t ......... troubleshooting
 * - g then r ......... resources
 * - ? ............... show this help
 */
import * as React from "react";
import { useRouter } from "next/navigation";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

const GOTO: Record<string, string> = {
  d: "/",
  f: "/faq",
  t: "/troubleshooting",
  r: "/resources",
  g: "/process-gaps",
};

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette / search" },
  { keys: ["G", "then", "D"], label: "Go to dashboard" },
  { keys: ["G", "then", "F"], label: "Go to FAQ" },
  { keys: ["G", "then", "T"], label: "Go to troubleshooting" },
  { keys: ["G", "then", "R"], label: "Go to resources" },
  { keys: ["?"], label: "Show this help" },
];

function isEditable(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = React.useState(false);
  const pendingG = React.useRef(false);
  const gTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (pendingG.current) {
        const dest = GOTO[e.key.toLowerCase()];
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        if (dest) {
          e.preventDefault();
          router.push(dest);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => (pendingG.current = false), 1200);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [router]);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Move around the playbook without the mouse.</DialogDescription>
        </DialogHeader>
        <div className="divide-y divide-border px-6 pb-6">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-foreground/90">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) =>
                  k === "then" ? (
                    <span key={i} className="text-xs text-muted-foreground">
                      then
                    </span>
                  ) : (
                    <kbd
                      key={i}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {k}
                    </kbd>
                  ),
                )}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

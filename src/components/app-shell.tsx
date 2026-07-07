"use client";

/* eslint-disable @next/next/no-img-element -- static export logo, intentionally a plain <img> */

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Keyboard } from "lucide-react";

import { asset } from "@/lib/utils";
import { Button } from "./ui/button";
import { SidebarNav } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

function Brand() {
  return (
    <Link href="/" className="flex flex-col gap-1 leading-none group" aria-label="BuildVision — home">
      {/* Sidebar is always dark indigo, so use the light-on-dark wordmark. */}
      <img src={asset("/brand/wordmark-on-dark.png")} alt="BuildVision" className="h-4 w-auto" />
      <span className="text-[11px] text-[var(--sidebar-foreground)]/55">Customer Onboarding</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { setOpen } = useCommandPalette();
  const pathname = usePathname();

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // The public intake form is customer-facing: render it without app chrome.
  if (pathname.startsWith("/intake")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar — deep indigo panel with a top sheen + edge shadow for depth */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-[var(--sidebar-foreground)] shadow-[6px_0_28px_-18px_rgba(0,0,0,0.65)] lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20"
        />
        <div className="relative flex h-14 shrink-0 items-center px-5">
          <Brand />
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          showClose
          className="flex flex-col left-0 top-0 h-[100dvh] w-[17rem] max-w-[17rem] translate-x-0 rounded-none rounded-r-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left p-0 bg-sidebar text-[var(--sidebar-foreground)] border-sidebar-border"
        >
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex h-14 items-center px-5">
            <Brand />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group flex h-9 flex-1 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-xs"
            aria-label="Search the playbook"
          >
            <Search className="size-4" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keyboard shortcuts"
              onClick={() => {
                // Dispatch the "?" handler used by KeyboardShortcuts.
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
              }}
              className="hidden sm:inline-flex"
            >
              <Keyboard className="size-4" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

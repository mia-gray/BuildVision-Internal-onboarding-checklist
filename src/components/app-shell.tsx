"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Keyboard, Compass } from "lucide-react";

import { Button } from "./ui/button";
import { SidebarNav } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette";
import { useCatalog } from "./providers/catalog-provider";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

function Brand() {
  const { meta } = useCatalog();
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Compass className="size-4" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">{meta.org}</span>
        <span className="text-[11px] text-muted-foreground">Onboarding Playbook</span>
      </span>
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

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-14 shrink-0 items-center px-5">
          <Brand />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>

      {/* Mobile drawer */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          showClose
          className="flex flex-col left-0 top-0 h-[100dvh] w-[17rem] max-w-[17rem] translate-x-0 rounded-none rounded-r-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left p-0"
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

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  FileText,
  HelpCircle,
  Wrench,
  Library,
  AlertTriangle,
  CornerDownLeft,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { useCatalog } from "./providers/catalog-provider";
import { searchDocs } from "@/lib/search";
import type { SearchDoc } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext);
  if (!ctx) throw new Error("useCommandPalette must be used within <CommandPaletteProvider>");
  return ctx;
}

const KIND_ICON: Record<SearchDoc["kind"], typeof FileText> = {
  section: FileText,
  step: CornerDownLeft,
  faq: HelpCircle,
  troubleshooting: Wrench,
  resource: Library,
  gap: AlertTriangle,
};

const KIND_LABEL: Record<SearchDoc["kind"], string> = {
  section: "Section",
  step: "Step",
  faq: "FAQ",
  troubleshooting: "Troubleshooting",
  resource: "Resource",
  gap: "Process gap",
};

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();
  const catalog = useCatalog();

  const toggle = React.useCallback(() => setOpen((o) => !o), []);

  // Global Cmd/Ctrl+K.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggle]);

  // Reset query shortly after close.
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setQuery(""), 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  const results = React.useMemo(
    () => (query.trim() ? searchDocs(query, catalog.searchIndex, 24) : []),
    [query, catalog.searchIndex],
  );

  const quickLinks = React.useMemo(
    () => [
      { href: "/", title: "Dashboard", icon: LayoutDashboard },
      { href: "/faq", title: "FAQ", icon: HelpCircle },
      { href: "/troubleshooting", title: "Troubleshooting", icon: Wrench },
      { href: "/resources", title: "Resources", icon: Library },
      { href: "/process-gaps", title: "Process Gaps", icon: AlertTriangle },
    ],
    [],
  );

  function go(href: string) {
    setOpen(false);
    if (href.startsWith("http") || href.startsWith("mailto")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  }

  const value = React.useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showClose={false} className="max-w-xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Search the playbook</DialogTitle>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search steps, FAQs, resources…"
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim() && results.length === 0 && (
                <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
                  No results for “{query}”.
                </Command.Empty>
              )}

              {!query.trim() && (
                <>
                  <Command.Group heading="Sections">
                    {catalog.sections.map((s) => (
                      <PaletteItem
                        key={s.slug}
                        onSelect={() => go(`/sections/${s.slug}`)}
                        icon={FileText}
                        title={s.title}
                        meta={s.phase}
                      />
                    ))}
                  </Command.Group>
                  <Command.Group heading="Go to">
                    {quickLinks.map((q) => (
                      <PaletteItem
                        key={q.href}
                        onSelect={() => go(q.href)}
                        icon={q.icon}
                        title={q.title}
                      />
                    ))}
                  </Command.Group>
                </>
              )}

              {results.length > 0 && (
                <Command.Group heading={`${results.length} result${results.length === 1 ? "" : "s"}`}>
                  {results.map((r) => (
                    <PaletteItem
                      key={r.id}
                      onSelect={() => go(r.href)}
                      icon={KIND_ICON[r.kind]}
                      title={r.title}
                      meta={r.context ? `${KIND_LABEL[r.kind]} · ${r.context}` : KIND_LABEL[r.kind]}
                    />
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </CommandPaletteContext.Provider>
  );
}

function PaletteItem({
  onSelect,
  icon: Icon,
  title,
  meta,
}: {
  onSelect: () => void;
  icon: typeof FileText;
  title: string;
  meta?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm outline-none",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground group-data-[selected=true]:text-foreground" />
      <span className="min-w-0 flex-1 truncate">{title}</span>
      {meta && (
        <span className="shrink-0 truncate text-xs text-muted-foreground">{meta}</span>
      )}
      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}

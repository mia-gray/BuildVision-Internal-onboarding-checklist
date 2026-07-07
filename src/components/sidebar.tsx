"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  Wrench,
  Library,
  AlertTriangle,
  Check,
  Bookmark,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useCatalog } from "./providers/catalog-provider";
import { useProgress } from "./providers/progress-provider";

function NavLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent font-medium text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sections } = useCatalog();
  const { completed, bookmarks, hydrated } = useProgress();

  const knowledge = [
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/troubleshooting", label: "Troubleshooting", icon: Wrench },
    { href: "/resources", label: "Resources", icon: Library },
    { href: "/process-gaps", label: "Process Gaps", icon: AlertTriangle },
  ];

  const bookmarkedSections = sections.filter((s) => bookmarks.has(`/sections/${s.slug}`));

  return (
    <nav className="flex h-full flex-col gap-0.5 px-3 pb-6">
      <GroupLabel>Overview</GroupLabel>
      <NavLink href="/" active={pathname === "/"} onNavigate={onNavigate}>
        <LayoutDashboard className="size-4 shrink-0" />
        Dashboard
      </NavLink>

      <GroupLabel>Onboarding workflow</GroupLabel>
      {sections.map((s) => {
        const href = `/sections/${s.slug}`;
        const active = pathname === href;
        const done = s.steps.filter((st) => completed.has(st.id)).length;
        const total = s.steps.length;
        const allDone = hydrated && done === total && total > 0;
        const Icon = getIcon(s.icon);
        return (
          <NavLink key={s.slug} href={href} active={active} onNavigate={onNavigate}>
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">{s.shortTitle ?? s.title}</span>
            {hydrated &&
              (allDone ? (
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-[var(--success-foreground)]"
                  aria-label="Section complete"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              ) : done > 0 ? (
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {done}/{total}
                </span>
              ) : null)}
          </NavLink>
        );
      })}

      {bookmarkedSections.length > 0 && (
        <>
          <GroupLabel>Bookmarked</GroupLabel>
          {bookmarkedSections.map((s) => {
            const href = `/sections/${s.slug}`;
            return (
              <NavLink key={s.slug} href={href} active={pathname === href} onNavigate={onNavigate}>
                <Bookmark className="size-4 shrink-0 fill-current" />
                <span className="truncate">{s.shortTitle ?? s.title}</span>
              </NavLink>
            );
          })}
        </>
      )}

      <GroupLabel>Knowledge base</GroupLabel>
      {knowledge.map((k) => (
        <NavLink key={k.href} href={k.href} active={pathname === k.href} onNavigate={onNavigate}>
          <k.icon className="size-4 shrink-0" />
          {k.label}
        </NavLink>
      ))}
    </nav>
  );
}

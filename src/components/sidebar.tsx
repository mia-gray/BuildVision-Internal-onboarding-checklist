"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  HelpCircle,
  Wrench,
  Library,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useCatalog } from "./providers/catalog-provider";
import { useCustomers } from "@/lib/customer/store";
import { customerPath } from "@/lib/customer/paths";
import { CustomerAvatar } from "./customer/avatar";
import { CreateCustomerDialog } from "./customer/create-customer-dialog";

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
  const { customers, recentIds } = useCustomers();

  const customersActive = pathname === "/" || pathname.startsWith("/customers");
  const recent = recentIds
    .map((id) => customers.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, 4);

  const knowledge = [
    { href: "/playbook", label: "Playbook", icon: BookOpen },
    { href: "/faq", label: "FAQ", icon: HelpCircle },
    { href: "/troubleshooting", label: "Troubleshooting", icon: Wrench },
    { href: "/resources", label: "Resources", icon: Library },
    { href: "/process-gaps", label: "Process Gaps", icon: AlertTriangle },
  ];

  return (
    <nav className="flex h-full flex-col gap-0.5 px-3 pb-6">
      <GroupLabel>Workspace</GroupLabel>
      <NavLink href="/" active={customersActive} onNavigate={onNavigate}>
        <Users className="size-4 shrink-0" />
        Customers
      </NavLink>
      <div className="px-1 pt-1">
        <CreateCustomerDialog
          trigger={
            <button className="flex w-full items-center gap-2 rounded-md border border-dashed border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
              <Plus className="size-4 shrink-0" />
              New customer
            </button>
          }
        />
      </div>

      {recent.length > 0 && (
        <>
          <GroupLabel>Recent</GroupLabel>
          {recent.map(
            (c) =>
              c && (
                <NavLink
                  key={c.id}
                  href={customerPath(c.id)}
                  active={false}
                  onNavigate={onNavigate}
                >
                  <CustomerAvatar
                    name={c.name}
                    logoUrl={c.logoUrl}
                    size="sm"
                    className="size-5 rounded-md text-[9px]"
                  />
                  <span className="truncate">{c.name}</span>
                </NavLink>
              ),
          )}
        </>
      )}

      <GroupLabel>Knowledge base</GroupLabel>
      {knowledge.map((k) => (
        <NavLink key={k.href} href={k.href} active={pathname === k.href} onNavigate={onNavigate}>
          <k.icon className="size-4 shrink-0" />
          {k.label}
        </NavLink>
      ))}

      <GroupLabel>Onboarding SOPs</GroupLabel>
      {sections.map((s) => {
        const href = `/sections/${s.slug}`;
        const Icon = getIcon(s.icon);
        return (
          <NavLink key={s.slug} href={href} active={pathname === href} onNavigate={onNavigate}>
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{s.shortTitle ?? s.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

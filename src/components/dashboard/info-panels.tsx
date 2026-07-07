"use client";

import Link from "next/link";
import {
  HelpCircle,
  Wrench,
  Library,
  AlertTriangle,
  LogIn,
  BookOpen,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { CopyButton } from "@/components/copy-button";

function PanelShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

const QUICK_LINKS = [
  { href: "/faq", label: "FAQ", icon: HelpCircle, external: false },
  { href: "/troubleshooting", label: "Troubleshooting", icon: Wrench, external: false },
  { href: "/resources", label: "Resources", icon: Library, external: false },
  { href: "/process-gaps", label: "Process Gaps", icon: AlertTriangle, external: false },
  { href: "https://app.buildvision.io/login", label: "Open BuildVision", icon: LogIn, external: true },
  { href: "https://buildvision-docs.vercel.app/", label: "BuildVision Docs", icon: BookOpen, external: true },
];

export function QuickLinks() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-semibold">Quick links</h3>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-2">
        {QUICK_LINKS.map((l) => {
          const inner = (
            <>
              <l.icon className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
              <span className="min-w-0 flex-1 truncate">{l.label}</span>
              {l.external && <ExternalLink className="size-3 shrink-0 text-muted-foreground" />}
            </>
          );
          const className =
            "group flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent";
          return l.external ? (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={className}>
              {inner}
            </a>
          ) : (
            <Link key={l.href} href={l.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TeamContacts() {
  const { meta } = useCatalog();
  return (
    <PanelShell title="Your onboarding team">
      <ul className="divide-y divide-border">
        {meta.contacts.map((c) => (
          <li key={c.email} className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
              {c.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={`mailto:${c.email}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label={`Email ${c.name}`}
              >
                <Mail className="size-4" />
              </a>
              {c.phone && (
                <a
                  href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={`Call ${c.name}`}
                >
                  <Phone className="size-4" />
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

export function EndpointsPanel() {
  const { meta } = useCatalog();
  return (
    <PanelShell title="Key endpoints">
      <ul className="divide-y divide-border">
        {meta.endpoints.map((e) => (
          <li key={e.label} className="flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{e.label}</p>
              {e.href ? (
                <a
                  href={e.href}
                  target={e.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-primary hover:underline"
                >
                  {e.value}
                </a>
              ) : (
                <p className="truncate text-sm font-medium">{e.value}</p>
              )}
            </div>
            <CopyButton value={e.value} variant="ghost" size="icon" label="" />

          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

export function RoadmapPanel() {
  const { meta } = useCatalog();
  return (
    <PanelShell title="90-day roadmap">
      <ul className="space-y-1 p-1">
        {meta.roadmap.map((r) => (
          <li key={r.window} className="flex items-baseline gap-3 rounded-md px-2 py-1.5">
            <span className="w-20 shrink-0 font-mono text-[11px] font-medium text-primary">
              {r.window}
            </span>
            <span className="text-sm text-foreground/90">{r.focus}</span>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

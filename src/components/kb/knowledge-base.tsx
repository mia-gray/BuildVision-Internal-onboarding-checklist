"use client";

import * as React from "react";
import {
  Search,
  Rocket,
  MailCheck,
  Building2,
  UserPlus,
  ShieldCheck,
  KeyRound,
  Settings,
  Wrench,
  Video,
  FileDown,
  PlayCircle,
  BookOpen,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import type { KbArticle } from "@/lib/types";
import { asset, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/** Deliberate category order + icon per category. */
const CATEGORY_ORDER: { name: string; icon: LucideIcon }[] = [
  { name: "Getting Started", icon: Rocket },
  { name: "Bid Management", icon: MailCheck },
  { name: "Access Other Offices", icon: Building2 },
  { name: "Inviting Teammates", icon: UserPlus },
  { name: "Permissions", icon: ShieldCheck },
  { name: "Login Credentials", icon: KeyRound },
  { name: "Administration", icon: Settings },
  { name: "Troubleshooting", icon: Wrench },
  { name: "Training Videos", icon: Video },
];

function iconFor(category: string): LucideIcon {
  return CATEGORY_ORDER.find((c) => c.name === category)?.icon ?? BookOpen;
}

function matches(a: KbArticle, q: string): boolean {
  const hay = [a.title, a.description, a.category, ...(a.tags ?? [])].join(" ").toLowerCase();
  return hay.includes(q);
}

export function KnowledgeBase({ articles }: { articles: KbArticle[] }) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const categories = React.useMemo(() => {
    const present = new Set(articles.map((a) => a.category));
    const ordered = CATEGORY_ORDER.map((c) => c.name).filter((n) => present.has(n));
    // append any categories not in the known order
    const extra = [...present].filter((n) => !ordered.includes(n));
    return [...ordered, ...extra];
  }, [articles]);

  const q = query.trim().toLowerCase();
  const filtered = articles.filter((a) => (category === "All" || a.category === category) && (!q || matches(a, q)));
  const visibleCategories = categories.filter((c) => filtered.some((a) => a.category === c));

  return (
    <div className="space-y-6">
      {/* Search + quick links */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-md lg:flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, videos, topics…"
            className="pl-9"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <Chip active={category === "All"} onClick={() => setCategory("All")}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No guides match “{query}”.
        </div>
      ) : (
        <div className="space-y-8">
          {visibleCategories.map((cat) => {
            const Icon = iconFor(cat);
            const items = filtered.filter((a) => a.category === cat);
            return (
              <section key={cat}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-4 text-primary" />
                  {cat}
                  <span className="font-mono text-xs font-normal text-muted-foreground">{items.length}</span>
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {items.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function ActionLink({
  href,
  icon: Icon,
  children,
  external,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
    >
      <Icon className="size-3.5" />
      {children}
      {external && <ArrowUpRight className="size-3 text-muted-foreground" />}
    </a>
  );
}

function ArticleCard({ article }: { article: KbArticle }) {
  const Icon = iconFor(article.category);
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="mb-2 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{article.title}</h3>
            {article.videoComingSoon && <Badge variant="warning">Video soon</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{article.description}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {article.pdf && (
          <ActionLink href={asset(article.pdf)} icon={FileDown}>
            Open PDF
          </ActionLink>
        )}
        {article.video && (
          <ActionLink href={article.video} icon={PlayCircle} external>
            Watch video
          </ActionLink>
        )}
        {article.doc && (
          <ActionLink href={article.doc} icon={BookOpen} external>
            Read docs
          </ActionLink>
        )}
        {article.quickLinks?.map((link) => (
          <ActionLink
            key={link.href + link.label}
            href={link.href.endsWith(".pdf") && link.href.startsWith("/") ? asset(link.href) : link.href}
            icon={ArrowUpRight}
          >
            {link.label}
          </ActionLink>
        ))}
      </div>
    </div>
  );
}

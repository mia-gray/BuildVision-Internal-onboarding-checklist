"use client";

import * as React from "react";
import {
  Search,
  MailCheck,
  Building2,
  UserPlus,
  ShieldCheck,
  FolderOpen,
  Inbox,
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

/**
 * Category order + icon. Mirrors the onboarding-checklist sections so Help &
 * guides lines up with the journey, plus Troubleshooting and Training Videos.
 */
const CATEGORY_ORDER: { name: string; icon: LucideIcon }[] = [
  { name: "Your organization setup", icon: Building2 },
  { name: "Your team accounts", icon: UserPlus },
  { name: "Roles & access", icon: ShieldCheck },
  { name: "Email forwarding", icon: MailCheck },
  { name: "Catalog & project data", icon: FolderOpen },
  { name: "Bid / no-bid recommendations", icon: Inbox },
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

/** Categories present in the data, in the deliberate order (extras appended). */
function useCategories(articles: KbArticle[]): string[] {
  return React.useMemo(() => {
    const present = new Set(articles.map((a) => a.category));
    const ordered = CATEGORY_ORDER.map((c) => c.name).filter((n) => present.has(n));
    const extra = [...present].filter((n) => !ordered.includes(n));
    return [...ordered, ...extra];
  }, [articles]);
}

export function KnowledgeBase({
  articles,
  layout = "stacked",
}: {
  articles: KbArticle[];
  /** "stacked" = all categories in one scroll; "sidebar" = left category rail. */
  layout?: "stacked" | "sidebar";
}) {
  const categories = useCategories(articles);

  if (layout === "sidebar") {
    return <KnowledgeBaseSidebar articles={articles} categories={categories} />;
  }

  return <KnowledgeBaseStacked articles={articles} categories={categories} />;
}

/* ------------------------------- Stacked ------------------------------- */

function KnowledgeBaseStacked({
  articles,
  categories,
}: {
  articles: KbArticle[];
  categories: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const q = query.trim().toLowerCase();
  const filtered = articles.filter(
    (a) => (category === "All" || a.category === category) && (!q || matches(a, q)),
  );
  const visibleCategories = categories.filter((c) => filtered.some((a) => a.category === c));

  return (
    <div className="space-y-6">
      <div className="relative lg:max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides, videos, topics…"
          className="pl-9"
        />
      </div>

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
        <EmptyState query={query} />
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

/* ------------------------------- Sidebar ------------------------------- */

function KnowledgeBaseSidebar({
  articles,
  categories,
}: {
  articles: KbArticle[];
  categories: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>(categories[0] ?? "");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const countFor = (c: string) => articles.filter((a) => a.category === c).length;
  const results = searching ? articles.filter((a) => matches(a, q)) : articles.filter((a) => a.category === category);

  const ActiveIcon = iconFor(category);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left rail: search + category toolbar */}
      <aside className="lg:sticky lg:top-4 lg:w-56 lg:shrink-0 lg:self-start">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides…"
            className="pl-9"
          />
        </div>
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {categories.map((c) => {
            const Icon = iconFor(c);
            const active = !searching && c === category;
            return (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setQuery("");
                }}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors lg:w-full",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate">{c}</span>
                <span className="font-mono text-xs text-muted-foreground">{countFor(c)}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Right pane: selected category, or search results */}
      <div className="min-w-0 flex-1">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          {searching ? (
            <>
              <Search className="size-4 text-primary" />
              Results for “{query.trim()}”
              <span className="font-mono text-xs font-normal text-muted-foreground">{results.length}</span>
            </>
          ) : (
            <>
              <ActiveIcon className="size-4 text-primary" />
              {category}
              <span className="font-mono text-xs font-normal text-muted-foreground">{results.length}</span>
            </>
          )}
        </h3>

        {results.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {results.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Shared bits ------------------------------- */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
      {query.trim() ? <>No guides match “{query.trim()}”.</> : "No guides here yet."}
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

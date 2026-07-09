"use client";

import * as React from "react";
import Link from "next/link";
import {
  Printer,
  Filter,
  ChevronsDownUp,
  ChevronsUpDown,
  CheckCheck,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  XCircle,
  ImageOff,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import type { RelatedLink, Section } from "@/lib/types";
import { asset, cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { useProgress } from "@/components/providers/progress-provider";
import { useCatalog } from "@/components/providers/catalog-provider";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { StatusBadge } from "@/components/content-badges";
import { BookmarkButton } from "@/components/bookmark-button";
import { ClientGuideCard } from "./client-guide-card";
import { StepItem } from "./step-item";

function InfoList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items?: string[];
  icon: typeof Lightbulb;
  tone: "info" | "warning" | "danger";
}) {
  if (!items?.length) return null;
  const toneClass = {
    info: "text-[var(--info)]",
    warning: "text-[var(--warning)]",
    danger: "text-destructive",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn("size-4", toneClass)} />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
            <span className={cn("mt-2 size-1 shrink-0 rounded-full bg-current", toneClass)} />
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RelatedLinkRow({ link }: { link: RelatedLink }) {
  const external = link.external || link.href.startsWith("http");
  const className =
    "group flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent";
  const inner = (
    <>
      <span className="min-w-0 flex-1 truncate">{link.label}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </>
  );
  return external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {inner}
    </Link>
  );
}

export function SectionView({ section }: { section: Section }) {
  const { completed, toggleStep, completeMany, resetSection, pushRecent, hydrated } = useProgress();
  const { sections } = useCatalog();
  const Icon = getIcon(section.icon);

  const stepIds = React.useMemo(() => section.steps.map((s) => s.id), [section.steps]);
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => new Set());
  const [hideCompleted, setHideCompleted] = React.useState(false);

  // Record recently viewed once per section.
  React.useEffect(() => {
    pushRecent({ href: `/sections/${section.slug}`, title: section.title });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.slug]);

  const doneCount = section.steps.filter((s) => completed.has(s.id)).length;
  const total = section.steps.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const allComplete = hydrated && doneCount === total && total > 0;

  const idx = sections.findIndex((s) => s.slug === section.slug);
  const prev = idx > 0 ? sections[idx - 1] : null;
  const next = idx >= 0 && idx < sections.length - 1 ? sections[idx + 1] : null;

  const allExpanded = openIds.size >= stepIds.length && stepIds.length > 0;

  const visibleSteps = hideCompleted
    ? section.steps.filter((s) => !completed.has(s.id))
    : section.steps;

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground no-print">
          <Link href="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">{section.title}</span>
        </nav>

        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Icon className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {section.phase && (
                <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {section.phase}
                </span>
              )}
              <StatusBadge badge={section.badge} />
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{section.title}</h1>
            <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
              {section.summary}
            </p>
            {section.estimatedTime && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3.5" />
                Estimated time: {section.estimatedTime}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 no-print">
          <BookmarkButton href={`/sections/${section.slug}`} />
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
        </div>
      </div>

      {/* Client-ready guide (prominent, top of section) */}
      {section.clientGuide && (
        <ClientGuideCard label={section.clientGuide.label} href={section.clientGuide.href} />
      )}

      {/* Overview */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-sm font-semibold">Overview</h2>
        <Markdown>{section.overview}</Markdown>
      </section>

      {/* Prerequisites */}
      {section.prerequisites?.length ? (
        <InfoList
          title="Required prerequisites"
          items={section.prerequisites}
          icon={CheckCheck}
          tone="info"
        />
      ) : null}

      {/* Checklist */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Step-by-step checklist</h2>
            <p className="text-xs text-muted-foreground">
              {hydrated ? `${doneCount} of ${total} complete` : `${total} steps`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 no-print">
            <Button
              variant={hideCompleted ? "default" : "outline"}
              size="sm"
              onClick={() => setHideCompleted((v) => !v)}
            >
              <Filter />
              {hideCompleted ? "Showing open" : "Hide done"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenIds(allExpanded ? new Set() : new Set(stepIds))}
            >
              {allExpanded ? <ChevronsDownUp /> : <ChevronsUpDown />}
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>
          </div>
        </div>

        {/* progress bar */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                allComplete ? "bg-[var(--success)]" : "bg-primary",
              )}
              style={{ width: `${hydrated ? pct : 0}%` }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {hydrated ? `${pct}%` : "—"}
          </span>
        </div>

        <div className="space-y-2.5">
          {visibleSteps.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <CheckCheck className="mx-auto mb-2 size-6 text-[var(--success)]" />
              <p className="text-sm font-medium">All steps complete</p>
              <p className="text-xs text-muted-foreground">
                Turn off “Hide done” to review completed steps.
              </p>
            </div>
          ) : (
            visibleSteps.map((step) => {
              const realIndex = section.steps.findIndex((s) => s.id === step.id);
              return (
                <StepItem
                  key={step.id}
                  step={step}
                  index={realIndex}
                  done={hydrated && completed.has(step.id)}
                  onToggleDone={() => toggleStep(step.id)}
                  open={openIds.has(step.id)}
                  onOpenChange={(o) =>
                    setOpenIds((prev) => {
                      const nextSet = new Set(prev);
                      if (o) nextSet.add(step.id);
                      else nextSet.delete(step.id);
                      return nextSet;
                    })
                  }
                />
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 no-print">
          <Button variant="ghost" size="sm" onClick={() => completeMany(stepIds, true)}>
            <CheckCheck /> Mark all complete
          </Button>
          {hydrated && doneCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => resetSection(stepIds)}
            >
              <RotateCcw /> Reset section
            </Button>
          )}
        </div>
      </section>

      {/* Tips / Warnings / Common mistakes */}
      {(section.tips?.length || section.warnings?.length || section.commonMistakes?.length) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InfoList title="Tips" items={section.tips} icon={Lightbulb} tone="info" />
          <InfoList title="Warnings" items={section.warnings} icon={AlertTriangle} tone="warning" />
          <InfoList
            title="Common mistakes"
            items={section.commonMistakes}
            icon={XCircle}
            tone="danger"
          />
        </div>
      )}

      {/* Screenshots */}
      {section.screenshots?.length ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Screenshots</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.screenshots.map((shot, i) => (
              <figure key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                {shot.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset(shot.src)} alt={shot.caption} className="w-full" />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-muted/50 text-muted-foreground">
                    <div className="flex flex-col items-center gap-1.5">
                      <ImageOff className="size-6" />
                      <span className="text-xs">Screenshot placeholder</span>
                    </div>
                  </div>
                )}
                <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Related */}
      {section.related?.length ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Related</h2>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {section.related.map((link) => (
              <RelatedLinkRow key={link.href + link.label} link={link} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Prev / Next */}
      <nav className="flex items-center justify-between gap-3 border-t border-border pt-6 no-print">
        {prev ? (
          <Button asChild variant="outline">
            <Link href={`/sections/${prev.slug}`}>
              <ArrowLeft />
              <span className="max-w-[40vw] truncate">{prev.shortTitle ?? prev.title}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild>
            <Link href={`/sections/${next.slug}`}>
              <span className="max-w-[40vw] truncate">{next.shortTitle ?? next.title}</span>
              <ArrowRight />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/">
              Back to dashboard
              <ArrowRight />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}

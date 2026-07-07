"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { useProgress } from "@/components/providers/progress-provider";
import { Button } from "@/components/ui/button";

export function DashboardHero() {
  const { sections, meta } = useCatalog();
  const { completed, hydrated } = useProgress();

  // Find the first section that isn't fully complete.
  const nextSection =
    sections.find((s) => s.steps.some((st) => !completed.has(st.id))) ?? sections[0];
  const anyProgress = hydrated && completed.size > 0;

  return (
    <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          Customer Success &amp; Operations
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          New Client Setup
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{meta.tagline}</p>
      </div>
      {nextSection && (
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild size="lg">
            <Link href={`/sections/${nextSection.slug}`}>
              {anyProgress ? "Continue" : "Start onboarding"}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

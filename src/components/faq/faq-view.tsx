"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/markdown";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function FaqView() {
  const { faq } = useCatalog();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("All");

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    faq.forEach((f) => f.category && set.add(f.category));
    return ["All", ...[...set].sort()];
  }, [faq]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return faq.filter((f) => {
      const matchesCat = category === "All" || f.category === category;
      const matchesQ =
        !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [faq, query, category]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 no-print">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === c
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No questions match “{query}”.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-5">
          <Accordion type="multiple" className="w-full">
            {filtered.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger id={f.id} className="scroll-mt-20">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent>
                  <Markdown className="text-foreground/80">{f.answer}</Markdown>
                  {f.related?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {f.related.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground/80 transition-colors hover:bg-accent"
                        >
                          {r.label}
                          <ArrowUpRight className="size-3" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}

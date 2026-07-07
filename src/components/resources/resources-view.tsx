"use client";

import Link from "next/link";
import { ExternalLink, ArrowUpRight, TriangleAlert } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { getIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Order categories deliberately rather than alphabetically.
const CATEGORY_ORDER = ["Internal links", "Documentation", "SOPs", "Templates", "Videos"];

export function ResourcesView() {
  const { resources } = useCatalog();

  const grouped = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const rank = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  const categories = Object.keys(grouped).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <section key={cat}>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{cat}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {grouped[cat].map((r) => {
              const Icon = getIcon(r.icon);
              const external = r.external || r.href.startsWith("http") || r.href.startsWith("mailto");
              const inner = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      {r.placeholder && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge variant="warning" className="gap-1">
                                <TriangleAlert className="size-3" />
                                Needs link
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            This link is a placeholder in the source. Publish the real URL and update
                            content/resources.json.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {r.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {r.description}
                      </p>
                    )}
                  </div>
                  {external ? (
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  ) : (
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </>
              );
              const className =
                "group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40";
              return external ? (
                <a
                  key={r.id}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link key={r.id} href={r.href} className={className}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

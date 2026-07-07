"use client";

import { Bookmark } from "lucide-react";

import { useProgress } from "./providers/progress-provider";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function BookmarkButton({ href }: { href: string }) {
  const { isBookmarked, toggleBookmark, hydrated } = useProgress();
  const active = hydrated && isBookmarked(href);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggleBookmark(href)}
      aria-pressed={active}
    >
      <Bookmark className={cn("size-4", active && "fill-current text-primary")} />
      {active ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}

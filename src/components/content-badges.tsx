import { Clock, Lock } from "lucide-react";

import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { OWNER_LABELS } from "@/lib/utils";
import type { Badge as BadgeType, Owner } from "@/lib/types";

/** Status badge: Required / Optional / Advanced. */
export function StatusBadge({ badge }: { badge?: BadgeType }) {
  if (!badge) return null;
  const variant =
    badge === "Required" ? "default" : badge === "Optional" ? "secondary" : "warning";
  return <Badge variant={variant}>{badge}</Badge>;
}

/** Owner chips, e.g. CS + ENG, with a tooltip expanding the abbreviation. */
export function OwnerBadges({ owners }: { owners?: Owner[] }) {
  if (!owners?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {owners.map((o) => (
        <Tooltip key={o}>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default items-center rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground">
              {o}
            </span>
          </TooltipTrigger>
          <TooltipContent>{OWNER_LABELS[o] ?? o}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/** Small time estimate pill. */
export function TimePill({ time }: { time?: string }) {
  if (!time) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="size-3" />
      {time}
    </span>
  );
}

/** Marks a hard verification gate. */
export function GateBadge() {
  return (
    <Badge variant="success" className="gap-1">
      <Lock className="size-3" />
      Gate
    </Badge>
  );
}

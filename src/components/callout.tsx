import { Lightbulb, AlertTriangle, ShieldAlert, Info, CircleCheckBig } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CalloutType } from "@/lib/types";
import { Markdown } from "./markdown";

const CONFIG: Record<
  CalloutType,
  { icon: typeof Info; label: string; className: string; iconClass: string }
> = {
  tip: {
    icon: Lightbulb,
    label: "Tip",
    className:
      "border-[color-mix(in_oklch,var(--info)_30%,transparent)] bg-[color-mix(in_oklch,var(--info)_8%,transparent)]",
    iconClass: "text-[var(--info)]",
  },
  info: {
    icon: Info,
    label: "Note",
    className: "border-border bg-muted/50",
    iconClass: "text-muted-foreground",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className:
      "border-[color-mix(in_oklch,var(--warning)_35%,transparent)] bg-[color-mix(in_oklch,var(--warning)_12%,transparent)]",
    iconClass: "text-[var(--warning)]",
  },
  blocker: {
    icon: ShieldAlert,
    label: "Blocker",
    className:
      "border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_8%,transparent)]",
    iconClass: "text-destructive",
  },
  verify: {
    icon: CircleCheckBig,
    label: "Verification gate",
    className:
      "border-[color-mix(in_oklch,var(--success)_30%,transparent)] bg-[color-mix(in_oklch,var(--success)_8%,transparent)]",
    iconClass: "text-[var(--success)]",
  },
};

export function Callout({
  type,
  children,
  text,
  className,
}: {
  type: CalloutType;
  children?: React.ReactNode;
  text?: string;
  className?: string;
}) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", cfg.className, className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", cfg.iconClass)} strokeWidth={2} />
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {cfg.label}
        </p>
        <div className="text-foreground/90 leading-relaxed [&_p]:m-0">
          {text ? <Markdown>{text}</Markdown> : children}
        </div>
      </div>
    </div>
  );
}

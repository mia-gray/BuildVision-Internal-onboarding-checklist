import { CUSTOMER_STATUSES, type CustomerStatus } from "@/lib/customer/types";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-[color-mix(in_oklch,var(--info)_16%,transparent)] text-[var(--info)]",
  primary: "bg-primary/12 text-primary",
  warning:
    "bg-[color-mix(in_oklch,var(--warning)_22%,transparent)] text-[var(--warning-foreground)] dark:text-[var(--warning)]",
  success: "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]",
};

const DOT_CLASS: Record<string, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-[var(--info)]",
  primary: "bg-primary",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
};

export function CustomerStatusBadge({
  status,
  className,
}: {
  status: CustomerStatus;
  className?: string;
}) {
  const meta = CUSTOMER_STATUSES.find((s) => s.value === status) ?? CUSTOMER_STATUSES[0];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[meta.tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", DOT_CLASS[meta.tone])} />
      {meta.label}
    </span>
  );
}

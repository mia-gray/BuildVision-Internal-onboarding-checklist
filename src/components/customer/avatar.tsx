import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Customer logo if provided, otherwise a deterministic initials tile. Color is
 * derived from the name so each customer reads distinctly at a glance.
 */
const PALETTE = [
  "bg-primary/15 text-primary",
  "bg-[color-mix(in_oklch,var(--info)_18%,transparent)] text-[var(--info)]",
  "bg-[color-mix(in_oklch,var(--success)_18%,transparent)] text-[var(--success)]",
  "bg-[color-mix(in_oklch,var(--warning)_22%,transparent)] text-[var(--warning-foreground)] dark:text-[var(--warning)]",
  "bg-accent text-accent-foreground",
];

function hueIndex(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % PALETTE.length;
  return h;
}

export function CustomerAvatar({
  name,
  logoUrl,
  size = "md",
  className,
}: {
  name: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-14 text-lg" : "size-10 text-sm";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={name}
        className={cn("shrink-0 rounded-xl object-cover", sizeClass, className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-semibold",
        PALETTE[hueIndex(name)],
        sizeClass,
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

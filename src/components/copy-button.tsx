"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

/**
 * Copy-to-clipboard button for common text snippets. Shows a transient
 * confirmation and is fully keyboard accessible.
 */
export function CopyButton({
  value,
  label,
  variant = "outline",
  size = "sm",
  className,
}: {
  value: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); fail quietly.
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      className={cn(className)}
      aria-label={copied ? "Copied" : `Copy${label ? ` ${label}` : ""}`}
    >
      {copied ? (
        <Check className="text-[var(--success)]" />
      ) : (
        <Copy />
      )}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}

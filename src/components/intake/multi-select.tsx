"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Multi-select rendered as toggle chips. Value is the array of selected
 * options; clicking a chip adds/removes it. Used for fields where more than one
 * choice is valid (e.g. an org that is both a Rep and a Manufacturer).
 */
export function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const selected = new Set(value ?? []);
  const toggle = (opt: string) => {
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    // Preserve the option order defined in the schema.
    onChange(options.filter((o) => next.has(o)));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              on
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {on && <Check className="size-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

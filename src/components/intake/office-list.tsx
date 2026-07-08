"use client";

import { X, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Repeatable list of office-name inputs (add / remove). Value is a string[].
 * Used by the public intake form and the customer-page intake editor.
 */
export function OfficeList({
  value,
  onChange,
  placeholder = "Office name (e.g. Reno)",
  compact = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const items = value.length ? value : [""];

  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...items, ""]);
  const remove = (i: number) => {
    const next = items.filter((_, j) => j !== i);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((name, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className={cn(compact && "h-9")}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove office"
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="size-4" /> Add office
      </button>
    </div>
  );
}

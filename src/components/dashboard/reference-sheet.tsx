"use client";

import * as React from "react";
import { ClipboardList, Printer, ChevronDown, Eraser } from "lucide-react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "onboarding.reference-sheet.v1";

/**
 * A per-client intake Reference Sheet, fillable and persisted to localStorage.
 * Mirrors the source document's Reference Sheet so CS can capture intake fields
 * in the same place they run the checklist.
 */
export function ReferenceSheet() {
  const { meta } = useCatalog();
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [hydrated, setHydrated] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setValues(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values, hydrated]);

  const filled = Object.values(values).filter((v) => v && v.trim()).length;
  const company = values["Company"]?.trim();

  function set(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }));
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-xl border border-border bg-card">
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-3 p-5 text-left">
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <ClipboardList className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-sm font-semibold">
              Client Reference Sheet
              {hydrated && filled > 0 && (
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  {filled}/{meta.referenceFields.length}
                </span>
              )}
            </span>
            <span className="block truncate text-sm text-muted-foreground">
              {company ? `Editing: ${company}` : "Capture intake fields before you start the build"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {meta.referenceFields.map((field) => (
              <div key={field.label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                {field.type === "choice" && field.choices ? (
                  <div className="flex gap-1.5">
                    {field.choices.map((choice) => {
                      const active = values[field.label] === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => set(field.label, active ? "" : choice)}
                          className={cn(
                            "h-9 flex-1 rounded-md border text-sm transition-colors",
                            active
                              ? "border-primary bg-primary/10 font-medium text-primary"
                              : "border-input text-muted-foreground hover:bg-accent",
                          )}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    value={values[field.label] ?? ""}
                    onChange={(e) => set(field.label, e.target.value)}
                    placeholder="—"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setValues({})}
            >
              <Eraser /> Clear
            </Button>
            <p className="ml-auto text-xs text-muted-foreground">Saved in this browser</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

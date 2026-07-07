"use client";

import * as React from "react";

import { useCatalog } from "@/components/providers/catalog-provider";

/** Flat list of every checklist step id across all sections (the full template). */
export function useAllStepIds(): string[] {
  const { sections } = useCatalog();
  return React.useMemo(
    () => sections.flatMap((s) => s.steps.map((st) => st.id)),
    [sections],
  );
}

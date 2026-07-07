"use client";

import * as React from "react";

import { useCatalog } from "@/components/providers/catalog-provider";
import { useProgress } from "@/components/providers/progress-provider";

export interface PlaybookStats {
  totalSteps: number;
  doneSteps: number;
  totalSections: number;
  doneSections: number;
  totalGates: number;
  doneGates: number;
  percent: number;
}

/** Aggregate completion stats across the whole playbook. */
export function usePlaybookStats(): PlaybookStats {
  const { sections } = useCatalog();
  const { completed } = useProgress();

  return React.useMemo(() => {
    let totalSteps = 0;
    let doneSteps = 0;
    let doneSections = 0;
    let totalGates = 0;
    let doneGates = 0;

    for (const s of sections) {
      let sectionDone = 0;
      for (const step of s.steps) {
        totalSteps += 1;
        if (step.gate) totalGates += 1;
        if (completed.has(step.id)) {
          doneSteps += 1;
          sectionDone += 1;
          if (step.gate) doneGates += 1;
        }
      }
      if (s.steps.length > 0 && sectionDone === s.steps.length) doneSections += 1;
    }

    const percent = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
    return {
      totalSteps,
      doneSteps,
      totalSections: sections.length,
      doneSections,
      totalGates,
      doneGates,
      percent,
    };
  }, [sections, completed]);
}

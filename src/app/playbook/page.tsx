import type { Metadata } from "next";

import { DashboardHero } from "@/components/dashboard/hero";
import { OverallProgress } from "@/components/dashboard/overall-progress";
import { WorkflowList } from "@/components/dashboard/workflow-list";
import { QuickLinks, TeamContacts, EndpointsPanel, RoadmapPanel } from "@/components/dashboard/info-panels";
import { Snippets } from "@/components/dashboard/snippets";

export const metadata: Metadata = {
  title: "Playbook",
  description: "The standard BuildVision onboarding playbook — the reference SOP behind every customer's checklist.",
};

/**
 * The reference playbook (formerly the home page). This is the canonical SOP
 * that each customer's checklist is instantiated from — kept as a read-only
 * knowledge base while day-to-day work happens on customer pages.
 */
export default function PlaybookPage() {
  return (
    <div className="space-y-8">
      <DashboardHero />
      <OverallProgress />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold">Onboarding workflow</h2>
                <p className="text-xs text-muted-foreground">
                  The standard sequence — each customer gets their own copy of these steps.
                </p>
              </div>
            </div>
            <div className="p-2 sm:p-3">
              <WorkflowList />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <QuickLinks />
          <TeamContacts />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Snippets />
        <EndpointsPanel />
        <RoadmapPanel />
      </div>
    </div>
  );
}

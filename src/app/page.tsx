import { DashboardHero } from "@/components/dashboard/hero";
import { OverallProgress } from "@/components/dashboard/overall-progress";
import { WorkflowList } from "@/components/dashboard/workflow-list";
import { RecentlyViewed } from "@/components/dashboard/recently-viewed";
import { QuickLinks, TeamContacts, EndpointsPanel, RoadmapPanel } from "@/components/dashboard/info-panels";
import { Snippets } from "@/components/dashboard/snippets";
import { ReferenceSheet } from "@/components/dashboard/reference-sheet";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHero />

      <OverallProgress />

      <ReferenceSheet />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column — the ordered workflow */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold">Onboarding workflow</h2>
                <p className="text-xs text-muted-foreground">
                  Complete top to bottom — steps are in dependency order.
                </p>
              </div>
            </div>
            <div className="p-2 sm:p-3">
              <WorkflowList />
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <RecentlyViewed />
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

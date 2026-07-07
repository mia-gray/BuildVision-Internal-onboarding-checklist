import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ResourcesView } from "@/components/resources/resources-view";

export const metadata: Metadata = {
  title: "Resources",
  description: "Links, docs, templates, SOPs, and videos for client onboarding.",
};

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon="Library"
        title="Resources"
        description="Everything you reach for during onboarding — internal links, documentation, templates, SOPs, and training. Links marked “Needs link” are placeholders from the source to be filled in."
      />
      <ResourcesView />
    </div>
  );
}

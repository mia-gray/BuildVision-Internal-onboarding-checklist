import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { TroubleshootingView } from "@/components/troubleshooting/troubleshooting-view";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description: "Common setup problems, their causes, and how to resolve them.",
};

export default function TroubleshootingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon="Wrench"
        title="Troubleshooting"
        description="When setup goes sideways: the most common failures, why they happen, and exactly how to fix them — with links back to the relevant steps."
      />
      <TroubleshootingView />
    </div>
  );
}

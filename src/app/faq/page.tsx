import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { FaqView } from "@/components/faq/faq-view";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to recurring onboarding questions.",
};

export default function FaqPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        icon="HelpCircle"
        title="Frequently Asked Questions"
        description="Answers to the questions that come up most often during client setup — pulled from the onboarding source material."
      />
      <FaqView />
    </div>
  );
}

import type { Metadata } from "next";

import { getKb } from "@/lib/content";
import { PageHeader } from "@/components/page-header";
import { KnowledgeBase } from "@/components/kb/knowledge-base";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Customer-facing resource center — guides, PDFs, videos, and quick links by category.",
};

export default function KnowledgeBasePage() {
  const articles = getKb();
  return (
    <div className="space-y-8">
      <PageHeader
        icon="BookOpen"
        title="Knowledge Base"
        description="A self-service resource center — guides, PDFs, and training organized by topic. This is what customers can browse in their onboarding portal, so they never have to ask for basic setup help."
      />
      <KnowledgeBase articles={articles} />
    </div>
  );
}

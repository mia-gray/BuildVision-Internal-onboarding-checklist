import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSection, getSections } from "@/lib/content";
import { SectionView } from "@/components/section/section-view";

export function generateStaticParams() {
  return getSections().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "Not found" };
  return {
    title: section.title,
    description: section.summary,
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) notFound();
  return <SectionView section={section} />;
}

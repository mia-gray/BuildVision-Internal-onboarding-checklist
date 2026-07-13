/**
 * Server-side content loader.
 *
 * Reads the human-editable JSON in `/content` at request/build time so that
 * non-developers can add or edit files without touching application code.
 *
 * IMPORTANT: This module uses `node:fs` and must only be imported from Server
 * Components / server code. Client components receive content via the
 * `<CatalogProvider>` (see src/components/providers/catalog-provider.tsx).
 */
import fs from "node:fs";
import path from "node:path";

import type {
  Catalog,
  FaqItem,
  KbArticle,
  PlaybookMeta,
  ProcessGap,
  Resource,
  SearchDoc,
  Section,
  TroubleshootingItem,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readJson<T>(...segments: string[]): T {
  const file = path.join(CONTENT_DIR, ...segments);
  const raw = fs.readFileSync(file, "utf-8");
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(
      `Invalid JSON in content/${segments.join("/")}: ${(err as Error).message}`,
    );
  }
}

export function getMeta(): PlaybookMeta {
  return readJson<PlaybookMeta>("meta.json");
}

export function getSections(): Section[] {
  const dir = path.join(CONTENT_DIR, "sections");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const sections = files.map((f) => {
    const section = readJson<Section>("sections", f);
    if (!section.slug || !Array.isArray(section.steps)) {
      throw new Error(`content/sections/${f} is missing "slug" or "steps".`);
    }
    return section;
  });

  return sections.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function getSection(slug: string): Section | undefined {
  return getSections().find((s) => s.slug === slug);
}

export function getFaq(): FaqItem[] {
  return readJson<FaqItem[]>("faq.json");
}

export function getTroubleshooting(): TroubleshootingItem[] {
  return readJson<TroubleshootingItem[]>("troubleshooting.json");
}

export function getResources(): Resource[] {
  return readJson<Resource[]>("resources.json");
}

export function getGaps(): ProcessGap[] {
  return readJson<ProcessGap[]>("process-gaps.json");
}

export function getKb(): KbArticle[] {
  return readJson<KbArticle[]>("knowledge-base.json");
}

/** The total number of individually checkable steps across all sections. */
export function getTotalStepCount(sections = getSections()): number {
  return sections.reduce((sum, s) => sum + s.steps.length, 0);
}

/** Build a flat, serializable search index from every content record. */
export function buildSearchIndex(input?: {
  sections?: Section[];
  faq?: FaqItem[];
  troubleshooting?: TroubleshootingItem[];
  resources?: Resource[];
  gaps?: ProcessGap[];
}): SearchDoc[] {
  const sections = input?.sections ?? getSections();
  const faq = input?.faq ?? getFaq();
  const troubleshooting = input?.troubleshooting ?? getTroubleshooting();
  const resources = input?.resources ?? getResources();
  const gaps = input?.gaps ?? getGaps();

  const docs: SearchDoc[] = [];

  for (const s of sections) {
    docs.push({
      id: `section:${s.slug}`,
      title: s.title,
      body: [s.summary, s.overview, s.phase, s.estimatedTime, ...(s.tips ?? []), ...(s.warnings ?? [])]
        .filter(Boolean)
        .join(" "),
      kind: "section",
      href: `/sections/${s.slug}`,
      context: s.phase,
    });

    for (const step of s.steps) {
      docs.push({
        id: `step:${step.id}`,
        title: step.title,
        body: [step.description, step.verify, step.dependsOn, ...(step.callouts?.map((c) => c.text) ?? [])]
          .filter(Boolean)
          .join(" "),
        kind: "step",
        href: `/sections/${s.slug}#${step.id}`,
        context: s.title,
      });
    }
  }

  for (const f of faq) {
    docs.push({
      id: `faq:${f.id}`,
      title: f.question,
      body: f.answer,
      kind: "faq",
      href: `/faq#${f.id}`,
      context: "FAQ",
    });
  }

  for (const t of troubleshooting) {
    docs.push({
      id: `ts:${t.id}`,
      title: t.problem,
      body: [t.cause, t.resolution].join(" "),
      kind: "troubleshooting",
      href: `/troubleshooting#${t.id}`,
      context: "Troubleshooting",
    });
  }

  for (const r of resources) {
    docs.push({
      id: `res:${r.id}`,
      title: r.title,
      body: [r.description, r.category].filter(Boolean).join(" "),
      kind: "resource",
      href: r.href.startsWith("http") || r.href.startsWith("mailto") ? r.href : r.href,
      context: r.category,
    });
  }

  for (const g of gaps) {
    docs.push({
      id: `gap:${g.id}`,
      title: `${g.code} — ${g.title}`,
      body: [g.detail, g.suggestion, g.category].filter(Boolean).join(" "),
      kind: "gap",
      href: `/process-gaps#${g.id}`,
      context: "Process gap",
    });
  }

  return docs;
}

/** One call that assembles everything the client needs. */
export function getCatalog(): Catalog {
  const sections = getSections();
  const faq = getFaq();
  const troubleshooting = getTroubleshooting();
  const resources = getResources();
  const gaps = getGaps();
  return {
    meta: getMeta(),
    sections,
    faq,
    troubleshooting,
    resources,
    gaps,
    searchIndex: buildSearchIndex({ sections, faq, troubleshooting, resources, gaps }),
  };
}

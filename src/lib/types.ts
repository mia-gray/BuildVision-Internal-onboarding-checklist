/**
 * Content model for the onboarding playbook.
 *
 * All human-editable content lives in `/content/*.json` and conforms to these
 * shapes. Non-developers can edit those JSON files directly — see
 * `content/README.md` for the authoring guide. Keep this file in sync when the
 * content shape changes.
 */

/** Who owns / performs a task. */
export type Owner = "CS" | "OPS" | "ENG" | "EXEC" | "CUST";

/** Status badge for a section or step. */
export type Badge = "Required" | "Optional" | "Advanced";

/** Inline callout flavors rendered inside a step or overview. */
export type CalloutType = "tip" | "warning" | "blocker" | "info" | "verify";

export interface Callout {
  type: CalloutType;
  text: string;
}

/** A single, checkable task within a section. */
export interface Step {
  /** Stable id — used as the localStorage key for completion. Never reuse/rename. */
  id: string;
  title: string;
  /** Markdown-enabled longer description. */
  description?: string;
  owners?: Owner[];
  /** Human-readable estimate, e.g. "15 min". */
  time?: string;
  /** Human-readable dependency, e.g. "parent org exists". */
  dependsOn?: string;
  /** Verification criteria — what "done" looks like. */
  verify?: string;
  /** When true, this step is a hard gate: do not proceed until confirmed. */
  gate?: boolean;
  callouts?: Callout[];
}

export interface RelatedLink {
  label: string;
  /** Internal (/sections/...) or external (https://) link. */
  href: string;
  external?: boolean;
}

export interface Screenshot {
  /** Optional real asset path under /public. If omitted, a labeled placeholder renders. */
  src?: string;
  caption: string;
}

/** A checklist / SOP page. */
export interface Section {
  slug: string;
  title: string;
  /** Optional shorter label for the sidebar. */
  shortTitle?: string;
  /** Lucide icon name (see src/lib/icons.ts registry). */
  icon: string;
  /** One-line summary for nav, cards, and search. */
  summary: string;
  /** Markdown overview / context. */
  overview: string;
  badge?: Badge;
  /** Phase label from the master checklist, e.g. "Phase 1". */
  phase?: string;
  estimatedTime?: string;
  prerequisites?: string[];
  tips?: string[];
  warnings?: string[];
  commonMistakes?: string[];
  steps: Step[];
  /**
   * A client-ready PDF guide shown prominently at the top of the section, so CS
   * can hand it to a customer to follow. `href` points to a file under /public.
   */
  clientGuide?: { label: string; href: string };
  related?: RelatedLink[];
  screenshots?: Screenshot[];
  /** Ordering within the workflow. Lower = earlier. */
  order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  /** Markdown answer. */
  answer: string;
  category?: string;
  related?: RelatedLink[];
}

export interface TroubleshootingItem {
  id: string;
  problem: string;
  cause: string;
  resolution: string;
  /** Owner best positioned to resolve. */
  owner?: Owner;
  relatedSteps?: RelatedLink[];
  severity?: "low" | "medium" | "high";
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  href: string;
  /** Grouping, e.g. "Internal links", "Templates", "SOPs". */
  category: string;
  /** Lucide icon name. */
  icon?: string;
  external?: boolean;
  /** Flags a link that is a placeholder in the source and needs a real URL. */
  placeholder?: boolean;
}

/** A customer-facing knowledge-base article / guide. */
export interface KbArticle {
  id: string;
  title: string;
  description: string;
  /** e.g. "Getting Started", "Bid Management", "Training Videos". */
  category: string;
  tags?: string[];
  /** Path to a PDF under /public (base-path applied at render). */
  pdf?: string;
  /** External video URL, if available. */
  video?: string;
  /** External documentation URL. */
  doc?: string;
  quickLinks?: RelatedLink[];
  /** Flags a video article whose recording isn't published yet. */
  videoComingSoon?: boolean;
}

export interface ProcessGap {
  id: string;
  code: string;
  title: string;
  detail: string;
  category: "Referenced but incomplete" | "Undefined internal procedure" | "Operational gap";
  impact?: "low" | "medium" | "high";
  suggestion?: string;
}

export interface Contact {
  role: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ReferenceField {
  label: string;
  type?: "text" | "choice";
  choices?: string[];
  hint?: string;
}

export interface Snippet {
  id: string;
  label: string;
  value: string;
}

export interface RoadmapPhase {
  window: string;
  focus: string;
}

export interface PlaybookMeta {
  appName: string;
  org: string;
  tagline: string;
  sourceOfTruth: string;
  contacts: Contact[];
  endpoints: { label: string; value: string; href?: string }[];
  ownerLegend: { key: Owner; label: string }[];
  referenceFields: ReferenceField[];
  snippets: Snippet[];
  roadmap: RoadmapPhase[];
  lastUpdated: string;
  version: string;
}

/** A single searchable record built from all content. */
export interface SearchDoc {
  id: string;
  title: string;
  /** Concatenated searchable text. */
  body: string;
  kind: "section" | "step" | "faq" | "troubleshooting" | "resource" | "gap";
  href: string;
  /** Breadcrumb-ish context, e.g. section title. */
  context?: string;
}

/** Everything the client needs, serialized once by the server. */
export interface Catalog {
  meta: PlaybookMeta;
  sections: Section[];
  faq: FaqItem[];
  troubleshooting: TroubleshootingItem[];
  resources: Resource[];
  gaps: ProcessGap[];
  searchIndex: SearchDoc[];
}

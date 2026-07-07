import type { SearchDoc } from "./types";

/**
 * Tiny dependency-free full-text scorer. Ranks documents by token overlap with
 * a bias toward title matches and exact-phrase hits. Good enough for a few
 * hundred docs; swap for a real index (e.g. FlexSearch) if the corpus grows.
 */
export interface SearchResult extends SearchDoc {
  score: number;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function searchDocs(query: string, docs: SearchDoc[], limit = 20): SearchResult[] {
  const q = normalize(query).trim();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);

  const results: SearchResult[] = [];

  for (const doc of docs) {
    const title = normalize(doc.title);
    const body = normalize(doc.body);
    const context = normalize(doc.context ?? "");
    let score = 0;

    // Exact phrase bonuses.
    if (title.includes(q)) score += 60;
    if (body.includes(q)) score += 20;

    for (const t of tokens) {
      if (title.includes(t)) score += 12;
      if (title.startsWith(t)) score += 6;
      if (body.includes(t)) score += 4;
      if (context.includes(t)) score += 3;
    }

    if (score > 0) results.push({ ...doc, score });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

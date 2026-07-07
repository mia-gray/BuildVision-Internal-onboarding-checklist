import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Owner code → readable label. */
export const OWNER_LABELS: Record<string, string> = {
  CS: "Customer Success",
  OPS: "Operations",
  ENG: "Engineering",
  EXEC: "COO",
  CUST: "Client",
};

/**
 * Base path the app is served under (empty locally; "/<repo>" on GitHub Pages).
 * Inlined at build time because it is NEXT_PUBLIC_*.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prefix a public/ asset path with the base path. next/link and next/navigation
 * add the base path automatically, but a plain <img src> does not.
 */
export function asset(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

/** Slugify a string for use as an anchor id. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

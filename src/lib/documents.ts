/**
 * Small helpers shared by the internal document manager and the customer
 * portal's shared-documents list.
 */
import { asset } from "./utils";

/**
 * Max size for an inline (data: URL) upload on the static build. Files are
 * stored in localStorage, so we keep this modest to stay well under quota.
 * With the backend this cap is replaced by real object storage.
 */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

/** Resolve a document href: base-path internal paths, pass through the rest. */
export function resolveDocHref(url?: string): string | undefined {
  if (!url) return undefined;
  return url.startsWith("/") ? asset(url) : url;
}

/** Human-readable file size, e.g. "1.4 MB". */
export function formatBytes(bytes?: number): string | undefined {
  if (bytes == null) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

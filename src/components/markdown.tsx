import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/**
 * Renders a Markdown string with a tight, docs-like typography scale.
 * Used for section overviews, FAQ answers, and callouts.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground/90 [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0",
        "[&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
        "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

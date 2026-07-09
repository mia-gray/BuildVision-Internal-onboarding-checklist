"use client";

import * as React from "react";
import { FileDown, Download, Check, Link2, Send } from "lucide-react";

import { asset } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Prominent, client-ready download card shown at the top of a section. Lets CS
 * open/download the PDF guide or copy a shareable link to send to the customer.
 */
export function ClientGuideCard({ label, href }: { label: string; href: string }) {
  const [copied, setCopied] = React.useState(false);
  const [absUrl, setAbsUrl] = React.useState("");
  const fileHref = asset(href);

  React.useEffect(() => {
    setAbsUrl(`${window.location.origin}${fileHref}`);
  }, [fileHref]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absUrl || fileHref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 sm:flex-row sm:items-center sm:p-5 no-print">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
        <FileDown className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Send className="size-3.5 text-primary" />
          Client-ready guide
        </p>
        <p className="text-sm text-muted-foreground">
          {label} — a PDF you can send to the customer to follow along.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild size="sm">
          <a href={fileHref} target="_blank" rel="noopener noreferrer">
            <Download /> Open PDF
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={copyLink}>
          {copied ? <Check className="text-[var(--success)]" /> : <Link2 />}
          {copied ? "Link copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}

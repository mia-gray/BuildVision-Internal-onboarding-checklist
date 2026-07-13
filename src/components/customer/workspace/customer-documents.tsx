"use client";

import * as React from "react";
import {
  Paperclip,
  Link2,
  Upload,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
} from "lucide-react";

import type { Customer, AttachmentKind } from "@/lib/customer/types";
import { useCustomers } from "@/lib/customer/store";
import { formatRelative } from "@/lib/format";
import { resolveDocHref, formatBytes, MAX_UPLOAD_BYTES } from "@/lib/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function CustomerDocuments({ customer }: { customer: Customer }) {
  const { addAttachment, removeAttachment, setAttachmentShared } = useCustomers();
  const [mode, setMode] = React.useState<AttachmentKind>("link");
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [share, setShare] = React.useState(true);
  const [file, setFile] = React.useState<File | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sharedCount = customer.attachments.filter((a) => a.sharedWithCustomer).length;

  function reset() {
    setName("");
    setUrl("");
    setDescription("");
    setShare(true);
    setFile(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError("");
    if (f && f.size > MAX_UPLOAD_BYTES) {
      setError(`That file is ${formatBytes(f.size)}. Max ${formatBytes(MAX_UPLOAD_BYTES)} for in-browser uploads.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFile(f);
    if (f && !name.trim()) setName(f.name);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "link") {
      if (!name.trim() || !url.trim()) return;
      addAttachment(customer.id, {
        name,
        kind: "link",
        url: url.trim(),
        description,
        sharedWithCustomer: share,
      });
      reset();
      return;
    }
    // file
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      addAttachment(customer.id, {
        name: name.trim() || file.name,
        kind: "file",
        url: dataUrl,
        description,
        mimeType: file.type || undefined,
        size: file.size,
        sharedWithCustomer: share,
      });
      reset();
    } catch {
      setError("Couldn't read that file. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = mode === "link" ? Boolean(name.trim() && url.trim()) : Boolean(file);

  return (
    <section aria-labelledby="documents-heading" className="scroll-mt-20" id="documents">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip className="size-4 text-primary" />
        <h2 id="documents-heading" className="text-sm font-semibold">
          Documents
        </h2>
        <span className="text-xs text-muted-foreground">
          ({customer.attachments.length}
          {sharedCount > 0 && ` · ${sharedCount} shared`})
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {/* Add form */}
        <form onSubmit={submit} className="space-y-3 border-b border-border p-4 no-print">
          <div className="inline-flex rounded-lg border border-border p-0.5">
            <SegButton active={mode === "link"} onClick={() => { setMode("link"); setError(""); }}>
              <Link2 className="size-3.5" /> Link
            </SegButton>
            <SegButton active={mode === "file"} onClick={() => { setMode("file"); setError(""); }}>
              <Upload className="size-3.5" /> Upload file
            </SegButton>
          </div>

          {mode === "link" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Document name"
                className="h-9"
              />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…  (Drive, SharePoint, etc.)"
                className="h-9"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={onPickFile}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name (optional)"
                className="h-9"
              />
            </div>
          )}

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="h-9"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={share} onCheckedChange={(v) => setShare(Boolean(v))} />
              Share with customer
            </label>
            <Button type="submit" size="sm" disabled={!canSubmit || busy} className="ml-auto">
              {busy ? <Loader2 className="animate-spin" /> : <Paperclip />}
              {busy ? "Adding…" : "Add document"}
            </Button>
          </div>
          {mode === "file" && (
            <p className="text-[11px] text-muted-foreground">
              Files are stored in this browser for now. Cross-device delivery to the customer is enabled
              with the shared backend.
            </p>
          )}
        </form>

        {/* List */}
        {customer.attachments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No documents yet. Add a link or file above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {customer.attachments.map((a) => {
              const href = resolveDocHref(a.url);
              const isFile = a.kind === "file";
              return (
                <li key={a.id} className="group flex items-start gap-3 p-4">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    {isFile ? <FileText className="size-4" /> : <Link2 className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...(isFile ? { download: a.name } : {})}
                          className="truncate text-sm font-medium hover:text-primary hover:underline"
                        >
                          {a.name}
                        </a>
                      ) : (
                        <span className="truncate text-sm font-medium">{a.name}</span>
                      )}
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          a.sharedWithCustomer
                            ? "bg-[color-mix(in_oklch,var(--success)_16%,transparent)] text-[var(--success)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {a.sharedWithCustomer ? "Shared" : "Internal"}
                      </span>
                    </div>
                    {a.description && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.description}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {[
                        isFile ? "File" : "Link",
                        formatBytes(a.size),
                        a.addedBy,
                        formatRelative(a.addedAt),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 no-print">
                    <button
                      onClick={() => setAttachmentShared(customer.id, a.id, !a.sharedWithCustomer)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label={a.sharedWithCustomer ? "Stop sharing with customer" : "Share with customer"}
                      title={a.sharedWithCustomer ? "Stop sharing" : "Share with customer"}
                    >
                      {a.sharedWithCustomer ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        {...(isFile ? { download: a.name } : {})}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Open document"
                        title="Open"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                    <button
                      onClick={() => removeAttachment(customer.id, a.id)}
                      className="rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete document"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

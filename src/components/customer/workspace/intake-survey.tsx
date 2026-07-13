"use client";

import * as React from "react";
import { ClipboardList, Pencil, Check, X, Inbox } from "lucide-react";

import type { Customer, IntakeSurvey as IntakeSurveyData, TeamMember } from "@/lib/customer/types";
import { INTAKE_GROUPS, isFieldFilled, isFieldVisible, type IntakeField } from "@/lib/customer/intake-schema";
import { useCustomers } from "@/lib/customer/store";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OfficeList } from "@/components/intake/office-list";
import { TeamMemberList } from "@/components/intake/team-list";

function displayValue(field: IntakeField, value?: string): string {
  if (!isFieldFilled(value)) return "—";
  if (field.type === "date") return formatDate(value);
  return value as string;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={base}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={base + " h-9"}>
        <option value="">—</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return (
    <Input
      type={field.type === "date" ? "date" : field.type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

export function IntakeSurvey({ customer }: { customer: Customer }) {
  const { updateIntake } = useCustomers();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<IntakeSurveyData>(customer.intake);

  React.useEffect(() => {
    if (!editing) setDraft(customer.intake);
  }, [customer.intake, editing]);

  const anyData = INTAKE_GROUPS.some((g) => g.fields.some((f) => isFieldFilled(customer.intake[f.key])));

  function save() {
    updateIntake(customer.id, draft);
    setEditing(false);
  }

  return (
    <section aria-labelledby="intake-heading" className="scroll-mt-20" id="intake">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <h2 id="intake-heading" className="text-sm font-semibold">
            Intake Survey
          </h2>
          {customer.intakeSubmitted && (
            <Badge variant="success">Submitted {formatDate(customer.intake.submittedAt)}</Badge>
          )}
        </div>
        <div className="no-print">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <Button size="sm" onClick={save}>
                <Check /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X /> Cancel
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil /> {anyData ? "Edit" : "Add manually"}
            </Button>
          )}
        </div>
      </div>

      {!anyData && !editing ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-10 text-center">
          <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Inbox className="size-5" />
          </span>
          <p className="text-sm font-medium">Awaiting intake</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Send the customer their intake link (top of page). Their answers land here automatically —
            or add them manually.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {INTAKE_GROUPS.map((group) => (
            <div key={group.id} className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h3>
              <dl className="space-y-3">
                {group.fields
                  .filter((field) =>
                    editing
                      ? isFieldVisible(field, draft)
                      : isFieldVisible(field, customer.intake) || isFieldFilled(customer.intake[field.key]),
                  )
                  .map((field) => (
                  <div key={field.key} className="grid grid-cols-1 gap-1">
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    {editing ? (
                      <dd>
                        {field.type === "team" ? (
                          <TeamMemberList
                            value={(draft[field.key] as TeamMember[]) ?? []}
                            onChange={(arr) => setDraft((d) => ({ ...d, [field.key]: arr }))}
                          />
                        ) : field.type === "list" ? (
                          <OfficeList
                            value={(draft[field.key] as string[]) ?? []}
                            onChange={(arr) => setDraft((d) => ({ ...d, [field.key]: arr }))}
                            placeholder={field.placeholder}
                            compact
                          />
                        ) : (
                          <FieldInput
                            field={field}
                            value={(draft[field.key] as string) ?? ""}
                            onChange={(v) => setDraft((d) => ({ ...d, [field.key]: v }))}
                          />
                        )}
                      </dd>
                    ) : field.type === "team" ? (
                      <dd className="text-sm">
                        {isFieldFilled(customer.intake[field.key]) ? (
                          <ul className="space-y-1">
                            {((customer.intake[field.key] as TeamMember[]) ?? [])
                              .filter((m) => m && (m.name || m.email))
                              .map((m, i) => (
                                <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="text-foreground/90">{m.name || m.email}</span>
                                  {m.name && m.email && (
                                    <span className="text-muted-foreground">· {m.email}</span>
                                  )}
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">
                                    {m.role || "Member"}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </dd>
                    ) : field.type === "list" ? (
                      <dd className="text-sm">
                        {isFieldFilled(customer.intake[field.key]) ? (
                          <div className="flex flex-wrap gap-1.5">
                            {((customer.intake[field.key] as string[]) ?? [])
                              .filter(Boolean)
                              .map((o, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground/90"
                                >
                                  {o}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </dd>
                    ) : (
                      <dd
                        className={
                          isFieldFilled(customer.intake[field.key])
                            ? "text-sm text-foreground/90 whitespace-pre-line"
                            : "text-sm text-muted-foreground/60"
                        }
                      >
                        {displayValue(field, customer.intake[field.key] as string)}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

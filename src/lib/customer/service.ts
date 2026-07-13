/**
 * Business logic — pure functions over Customer objects (no React, no storage).
 * The store calls these and persists the result via the repository. Keeping
 * this layer pure makes it trivially testable and backend-agnostic.
 */
import type {
  Customer,
  CustomerNote,
  CustomerStatus,
  IntakeSurvey,
  NewCustomerInput,
  NoteCategory,
  TimelineEvent,
  TimelineEventType,
} from "./types";

export const CSM_OPTIONS = ["Mia Gray", "Ben Lyddane", "Mackenzie Hoover"];

export function nowIso(): string {
  return new Date().toISOString();
}

function id(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

/** Short, URL-friendly id for customers (nicer in the address bar). */
function shortId(): string {
  return id().replace(/-/g, "").slice(0, 10);
}

/**
 * Longer, unguessable token for the shareable customer portal link. Distinct
 * from the internal id so the id is never exposed in a link handed to a client.
 */
export function makePortalToken(): string {
  return (id() + id()).replace(/-/g, "").slice(0, 24);
}

export function timelineEvent(
  type: TimelineEventType,
  label: string,
  opts: { detail?: string; by?: string; at?: string } = {},
): TimelineEvent {
  return { id: id(), type, label, detail: opts.detail, by: opts.by, at: opts.at ?? nowIso() };
}

export function createCustomer(input: NewCustomerInput): Customer {
  const at = nowIso();
  return {
    id: shortId(),
    name: input.name.trim(),
    companyName: (input.companyName || input.name).trim(),
    logoUrl: input.logoUrl,
    assignedCsm: input.assignedCsm,
    portalToken: makePortalToken(),
    status: "not_started",
    intake: { ...input.intake },
    intakeSubmitted: false,
    checklist: {},
    notes: [],
    timeline: [timelineEvent("customer_created", "Customer created", { by: input.assignedCsm, at })],
    attachments: [],
    archived: false,
    createdAt: at,
    updatedAt: at,
  };
}

/** Deep-ish clone for a duplicated customer with a fresh id and reset progress. */
export function duplicateCustomer(source: Customer, by: string): Customer {
  const at = nowIso();
  return {
    ...source,
    id: shortId(),
    portalToken: makePortalToken(),
    name: `${source.name} (copy)`,
    status: "not_started",
    checklist: {},
    notes: [],
    intakeSubmitted: source.intakeSubmitted,
    intake: { ...source.intake },
    timeline: [timelineEvent("customer_created", "Customer duplicated", { by, at })],
    attachments: [],
    archived: false,
    createdAt: at,
    updatedAt: at,
  };
}

function touch(customer: Customer): Customer {
  return { ...customer, updatedAt: nowIso() };
}

/** Progress across the full set of checklist step ids (from the content catalog). */
export function computeProgress(
  customer: Customer,
  allStepIds: string[],
): { done: number; total: number; percent: number } {
  const total = allStepIds.length;
  const done = allStepIds.reduce((n, sid) => n + (customer.checklist[sid]?.done ? 1 : 0), 0);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

/** Toggle/patch a single checklist item, recording who + when, plus timeline. */
export function setChecklistItem(
  customer: Customer,
  stepId: string,
  stepTitle: string,
  patch: { done?: boolean; note?: string },
  by: string,
): Customer {
  const prev = customer.checklist[stepId] ?? { done: false };
  const next = { ...prev, ...patch };
  let timeline = customer.timeline;

  if (patch.done !== undefined && patch.done !== prev.done) {
    if (patch.done) {
      next.completedAt = nowIso();
      next.completedBy = by;
      timeline = [timelineEvent("task_completed", `Completed: ${stepTitle}`, { by }), ...timeline];
    } else {
      next.completedAt = undefined;
      next.completedBy = undefined;
    }
  }

  let updated: Customer = {
    ...touch(customer),
    checklist: { ...customer.checklist, [stepId]: next },
    timeline,
  };

  // Auto-advance status from not_started → in_progress on first completion.
  if (patch.done && updated.status === "not_started") {
    updated = applyStatus(updated, "in_progress", by, { silent: false });
  }
  return updated;
}

export function addNote(
  customer: Customer,
  body: string,
  category: NoteCategory,
  author: string,
): Customer {
  const note: CustomerNote = { id: crypto.randomUUID?.() ?? `${Date.now()}`, body: body.trim(), category, author, createdAt: nowIso() };
  return {
    ...touch(customer),
    notes: [note, ...customer.notes],
    timeline: [timelineEvent("note_added", "Note added", { detail: category, by: author }), ...customer.timeline],
  };
}

export function removeNote(customer: Customer, noteId: string): Customer {
  return { ...touch(customer), notes: customer.notes.filter((n) => n.id !== noteId) };
}

export function updateIntake(
  customer: Customer,
  intake: IntakeSurvey,
  by: string,
  opts: { fromForm?: boolean } = {},
): Customer {
  const wasSubmitted = customer.intakeSubmitted;
  const submitted = opts.fromForm ? true : customer.intakeSubmitted;
  const at = nowIso();
  const timeline = opts.fromForm
    ? [timelineEvent("intake_submitted", "Intake form submitted", { by: customer.name, at }), ...customer.timeline]
    : [timelineEvent("intake_updated", "Intake details edited", { by }), ...customer.timeline];

  let updated: Customer = {
    ...touch(customer),
    intake: { ...intake, submittedAt: opts.fromForm ? at : customer.intake.submittedAt },
    intakeSubmitted: submitted,
    timeline,
  };

  // First-time submission nudges status forward.
  if (opts.fromForm && !wasSubmitted && updated.status === "not_started") {
    updated = applyStatus(updated, "intake_received", by, { silent: true });
  }
  return updated;
}

export function markIntakeSent(customer: Customer, by: string): Customer {
  return {
    ...touch(customer),
    timeline: [timelineEvent("intake_sent", "Intake link sent to customer", { by }), ...customer.timeline],
  };
}

export function applyStatus(
  customer: Customer,
  status: CustomerStatus,
  by: string,
  opts: { silent?: boolean } = {},
): Customer {
  if (customer.status === status) return customer;
  const timeline = opts.silent
    ? customer.timeline
    : [timelineEvent("status_changed", `Status → ${labelForStatus(status)}`, { by }), ...customer.timeline];
  return { ...touch(customer), status, timeline };
}

/** Append a checklist-finished milestone (called by the store when 100%). */
export function markChecklistFinished(customer: Customer, by: string): Customer {
  if (customer.timeline.some((e) => e.type === "checklist_finished")) return customer;
  return {
    ...touch(customer),
    timeline: [timelineEvent("checklist_finished", "Checklist completed", { by }), ...customer.timeline],
  };
}

export function labelForStatus(status: CustomerStatus): string {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "intake_received":
      return "Intake Received";
    case "in_progress":
      return "In Progress";
    case "waiting_on_customer":
      return "Waiting on Customer";
    case "completed":
      return "Completed";
  }
}

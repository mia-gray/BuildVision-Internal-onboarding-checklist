/**
 * Data models for the per-customer onboarding workspace.
 *
 * These are plain, serializable types (no framework coupling) so they can be
 * persisted to localStorage today and to Supabase / Firebase / Postgres later
 * without changing the UI. The data-access boundary is `CustomerRepository`
 * (see repository.ts); business logic lives in service.ts.
 */

export type CustomerStatus =
  | "not_started"
  | "intake_received"
  | "in_progress"
  | "waiting_on_customer"
  | "completed";

/** Ordered list + display metadata for statuses (single source of truth). */
export const CUSTOMER_STATUSES: {
  value: CustomerStatus;
  label: string;
  /** Semantic tone used by the StatusBadge. */
  tone: "neutral" | "info" | "primary" | "warning" | "success";
}[] = [
  { value: "not_started", label: "Not Started", tone: "neutral" },
  { value: "intake_received", label: "Intake Received", tone: "info" },
  { value: "in_progress", label: "In Progress", tone: "primary" },
  { value: "waiting_on_customer", label: "Waiting on Customer", tone: "warning" },
  { value: "completed", label: "Completed", tone: "success" },
];

/** The customer's intake survey responses. All optional until submitted. */
export interface IntakeSurvey {
  companyName?: string;
  /** How the org name should appear in BuildVision. */
  organizationName?: string;
  /** "Yes" | "No" — whether to create child offices. */
  addChildOffices?: string;
  /** Names of child offices to create (when addChildOffices = "Yes"). */
  childOffices?: string[];
  primaryContact?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  crmSystem?: string;
  /** "Email integration" | "Email Forwarding" — how BuildVision receives bids. */
  emailMethod?: string;
  /** The address bids are forwarded from (only when emailMethod = Email Forwarding). */
  bidInbox?: string;
  activeUsers?: string;
  requestedGoLiveDate?: string;
  projectNotes?: string;
  additionalComments?: string;
  /** Set when the customer submits the external intake form. */
  submittedAt?: string;
}

/** Completion state for a single checklist step, keyed by the step's stable id. */
export interface ChecklistItemState {
  done: boolean;
  completedAt?: string;
  completedBy?: string;
  note?: string;
}

export type ChecklistState = Record<string, ChecklistItemState>;

export type NoteCategory =
  | "general"
  | "meeting"
  | "update"
  | "request"
  | "follow_up"
  | "blocker";

export interface CustomerNote {
  id: string;
  body: string;
  author: string;
  category: NoteCategory;
  createdAt: string;
}

export type TimelineEventType =
  | "customer_created"
  | "intake_sent"
  | "intake_submitted"
  | "status_changed"
  | "task_completed"
  | "section_completed"
  | "note_added"
  | "checklist_finished"
  | "intake_updated";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  detail?: string;
  at: string;
  by?: string;
}

/** Future-ready: attachments are modeled now, surfaced in the UI later. */
export interface Attachment {
  id: string;
  name: string;
  url?: string;
  stepId?: string;
  addedAt: string;
  addedBy?: string;
}

/** The complete, self-contained onboarding workspace for one customer. */
export interface Customer {
  id: string;
  /** Primary display name (usually the account / company short name). */
  name: string;
  companyName: string;
  logoUrl?: string;
  assignedCsm: string;
  status: CustomerStatus;
  intake: IntakeSurvey;
  intakeSubmitted: boolean;
  checklist: ChecklistState;
  notes: CustomerNote[];
  timeline: TimelineEvent[];
  attachments: Attachment[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Input accepted when creating a customer. */
export interface NewCustomerInput {
  name: string;
  companyName?: string;
  assignedCsm: string;
  logoUrl?: string;
  intake?: Partial<IntakeSurvey>;
}

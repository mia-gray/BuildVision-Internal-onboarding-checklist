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

/** A person to provision in BuildVision, captured on the intake form. */
export interface TeamMember {
  name: string;
  email: string;
  /** "Admin" | "Member" */
  role: string;
}

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
  /** People who need access, with their permission level. */
  teamMembers?: TeamMember[];
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
  /** Teammates @mentioned in the note (full names from the team roster). */
  mentions?: string[];
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
  | "intake_updated"
  | "document_added"
  | "document_shared";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  detail?: string;
  at: string;
  by?: string;
}

/** How a document's contents are referenced. */
export type AttachmentKind = "link" | "file";

/**
 * A document attached to a customer. Either an external `link` (a URL the
 * customer can already reach — Drive, SharePoint, etc.) or an uploaded `file`.
 *
 * On the static/localStorage build a `file` is stored inline as a `data:` URL,
 * so it works within a browser (great for demos) but is not delivered across
 * devices — that requires the backend, at which point `url` becomes a hosted
 * link and nothing else here changes.
 */
export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  /** For `link`: the external URL. For `file`: a data: URL (static) or hosted URL (backend). */
  url?: string;
  /** Optional short description shown to internal staff and the customer. */
  description?: string;
  /** File metadata (kind = "file"). */
  mimeType?: string;
  size?: number;
  /** When true, the document is visible to the customer in their portal. */
  sharedWithCustomer: boolean;
  /** Opaque per-document reference for the shared link (backend-ready). */
  shareRef?: string;
  /** Optional link to a specific checklist step. */
  stepId?: string;
  addedAt: string;
  addedBy?: string;
}

/** Input accepted when attaching a document. */
export interface NewAttachmentInput {
  name: string;
  kind: AttachmentKind;
  url?: string;
  description?: string;
  mimeType?: string;
  size?: number;
  sharedWithCustomer?: boolean;
}

/** The complete, self-contained onboarding workspace for one customer. */
export interface Customer {
  id: string;
  /** Primary display name (usually the account / company short name). */
  name: string;
  companyName: string;
  logoUrl?: string;
  assignedCsm: string;
  /**
   * Opaque token used to build the external customer portal link
   * (`/onboarding/?token=…`). Kept separate from `id` so the internal id is
   * never exposed in a shared link. On a real backend this maps to a revocable
   * access grant; on static/localStorage it simply resolves the customer.
   */
  portalToken: string;
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

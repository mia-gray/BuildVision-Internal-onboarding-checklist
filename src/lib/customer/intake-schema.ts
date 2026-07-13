/**
 * Single source of truth for intake fields — drives BOTH the public intake form
 * (/intake/[id]) and the read-only "Intake Survey" cards on the customer page.
 * Add a field here and it appears in both places automatically.
 */
import type { IntakeSurvey } from "./types";

export type IntakeFieldType = "text" | "email" | "tel" | "textarea" | "select" | "date" | "list" | "team";

export interface IntakeField {
  key: keyof IntakeSurvey;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  /** Regex (as string) for lightweight validation on text-like fields. */
  pattern?: string;
  helper?: string;
  /** Only render this field when another field equals a given value (conditional). */
  showIf?: { key: keyof IntakeSurvey; equals: string };
}

export interface IntakeGroup {
  id: string;
  title: string;
  description?: string;
  fields: IntakeField[];
}

export const INTAKE_GROUPS: IntakeGroup[] = [
  {
    id: "company",
    title: "Company",
    description: "Tell us who you are.",
    fields: [
      { key: "companyName", label: "Company Name", type: "text", required: true, placeholder: "Acme Mechanical" },
      {
        key: "organizationName",
        label: "How should your organization name appear in BuildVision?",
        type: "text",
        placeholder: "e.g. Acme Mechanical",
        helper: "This is the name your team will see across BuildVision.",
      },
      {
        key: "addChildOffices",
        label: "Do you want any child offices added?",
        type: "select",
        options: ["No", "Yes"],
        helper: "Offices or branches nested under your main organization.",
      },
      {
        key: "childOffices",
        label: "Child office names",
        type: "list",
        placeholder: "Office name (e.g. Reno)",
        helper: "Add one box per office. You can add or remove as many as you need.",
        showIf: { key: "addChildOffices", equals: "Yes" },
      },
      {
        key: "industry",
        label: "Industry",
        type: "select",
        options: [
          "Manufacturer's Rep",
          "Contractor",
          "Manufacturer",
          "Engineering Firm",
          "Other",
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Primary Contact",
    description: "Who should we work with day to day?",
    fields: [
      { key: "primaryContact", label: "Primary Contact", type: "text", required: true, placeholder: "Full name + title" },
      { key: "email", label: "Email", type: "email", required: true, placeholder: "name@company.com" },
      { key: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567" },
      { key: "address", label: "Address", type: "textarea", placeholder: "Street, city, state, ZIP" },
    ],
  },
  {
    id: "engagement",
    title: "Your BuildVision Setup",
    description: "Details we need to configure your account.",
    fields: [
      {
        key: "emailMethod",
        label: "How should BuildVision receive your bids?",
        type: "select",
        options: ["Email integration", "Email Forwarding"],
        helper: "Email integration connects your inbox directly. Email Forwarding sends bids from an address you choose.",
      },
      {
        key: "bidInbox",
        label: "Email you'll forward bids from",
        type: "email",
        placeholder: "bids@yourcompany.com",
        helper: "We'll forward from here to Bids@BuildVision.io.",
        showIf: { key: "emailMethod", equals: "Email Forwarding" },
      },
      { key: "crmSystem", label: "CRM System in Use", type: "text", placeholder: "e.g. Salesforce, HubSpot" },
      {
        key: "teamMembers",
        label: "Users & permissions",
        type: "team",
        helper: "Add each person who needs access, with their name, email, and permission level.",
      },
      { key: "requestedGoLiveDate", label: "Requested Go-Live Date", type: "date" },
    ],
  },
  {
    id: "notes",
    title: "Anything else?",
    fields: [
      { key: "projectNotes", label: "Project Notes", type: "textarea", placeholder: "Goals, timeline, constraints…" },
      { key: "additionalComments", label: "Additional Comments", type: "textarea" },
    ],
  },
];

/** Flat list of every field, in group order. */
export const INTAKE_FIELDS: IntakeField[] = INTAKE_GROUPS.flatMap((g) => g.fields);

export function isFieldFilled(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((v) =>
      typeof v === "string"
        ? v.trim().length > 0
        : v != null && Object.values(v).some((x) => typeof x === "string" && x.trim().length > 0),
    );
  }
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

/** Whether a field should render given the current values (respects showIf). */
export function isFieldVisible(field: IntakeField, values: IntakeSurvey): boolean {
  if (!field.showIf) return true;
  return values[field.showIf.key] === field.showIf.equals;
}

/** Which fields are still missing among required ones (visible fields only). */
export function missingRequired(intake: IntakeSurvey): IntakeField[] {
  return INTAKE_FIELDS.filter(
    (f) => f.required && isFieldVisible(f, intake) && !isFieldFilled(intake[f.key]),
  );
}

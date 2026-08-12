/**
 * Single source of truth for intake fields — drives BOTH the public intake form
 * (/intake/[id]) and the read-only "Intake Survey" cards on the customer page.
 * Add a field here and it appears in both places automatically.
 */
import type { IntakeSurvey } from "./types";

export type IntakeFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "date"
  | "list"
  | "team"
  | "multiselect"
  | "assocOrgs";

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
    id: "organization",
    title: "Organization",
    fields: [
      { key: "companyName", label: "Organization", type: "text", required: true, placeholder: "Acme Mechanical" },
      {
        key: "website",
        label: "Organization URL",
        type: "text",
        placeholder: "https://acme.com",
      },
      { key: "phone", label: "Phone", type: "tel", placeholder: "(555) 123-4567" },
      { key: "address", label: "Address", type: "textarea", placeholder: "Street, city, state, ZIP" },
      {
        key: "organizationType",
        label: "Organization Type",
        type: "multiselect",
        options: ["Representative", "Manufacturer"],
        helper: "Select all that apply.",
      },
      {
        key: "equipmentSystems",
        label: "Equipment Systems",
        type: "multiselect",
        options: ["Mechanical", "Electrical", "Food Service"],
        helper: "Select all that apply.",
      },
      {
        key: "hasAssociatedOrgs",
        label: "Will you have any associated organizations?",
        type: "select",
        options: ["No", "Yes"],
      },
      {
        key: "associatedOrgs",
        label: "Associated organizations",
        type: "assocOrgs",
        helper: "Add each related organization and whether it's a parent or child. Add as many as needed.",
        showIf: { key: "hasAssociatedOrgs", equals: "Yes" },
      },
    ],
  },
  {
    id: "contact",
    title: "Primary Contact",
    fields: [
      { key: "primaryContact", label: "First Name", type: "text", required: true, placeholder: "First name" },
      { key: "contactLastName", label: "Last Name", type: "text", placeholder: "Last name" },
      { key: "contactTitle", label: "Title", type: "text", placeholder: "e.g. VP Sales" },
      { key: "email", label: "Email", type: "email", required: true, placeholder: "name@company.com" },
    ],
  },
  {
    id: "users",
    title: "Users",
    fields: [
      {
        key: "teamMembers",
        label: "Users to create",
        type: "team",
      },
    ],
  },
  {
    id: "engagement",
    title: "Admin Setup",
    fields: [
      {
        key: "emailMethod",
        label: "How should BuildVision receive your bids?",
        type: "select",
        options: ["Email integration", "Email forwarding"],
      },
      {
        key: "bidInbox",
        label: "Email you'll forward bids from",
        type: "email",
        placeholder: "bids@yourcompany.com",
        helper: "We'll forward from here to Bids@BuildVision.io.",
        showIf: { key: "emailMethod", equals: "Email forwarding" },
      },
      { key: "requestedGoLiveDate", label: "Requested Go-Live Date", type: "date" },
    ],
  },
  {
    id: "notes",
    title: "",
    fields: [
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

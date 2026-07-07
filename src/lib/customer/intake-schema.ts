/**
 * Single source of truth for intake fields — drives BOTH the public intake form
 * (/intake/[id]) and the read-only "Intake Survey" cards on the customer page.
 * Add a field here and it appears in both places automatically.
 */
import type { IntakeSurvey } from "./types";

export type IntakeFieldType = "text" | "email" | "tel" | "textarea" | "select" | "date";

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
      { key: "organizationName", label: "Organization Name", type: "text", placeholder: "Parent org, if different" },
      {
        key: "industry",
        label: "Industry",
        type: "select",
        options: [
          "Manufacturer's Rep",
          "Mechanical Contractor",
          "Distributor",
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
        key: "productsPurchased",
        label: "Products Purchased",
        type: "text",
        placeholder: "e.g. Data Platform, Dashboard",
      },
      {
        key: "implementationType",
        label: "Implementation Type",
        type: "select",
        options: ["Pilot", "Full License"],
      },
      { key: "crmSystem", label: "CRM System in Use", type: "text", placeholder: "e.g. Salesforce, HubSpot" },
      {
        key: "bidInbox",
        label: "Bid-desk Inbox to Forward",
        type: "email",
        placeholder: "bids@yourcompany.com",
        helper: "The inbox you'll forward bids from to Bids@BuildVision.io.",
      },
      { key: "activeUsers", label: "Active Users (count)", type: "text", placeholder: "e.g. 12" },
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
  return typeof value === "string" ? value.trim().length > 0 : value != null;
}

/** Which fields are still missing among required ones. */
export function missingRequired(intake: IntakeSurvey): IntakeField[] {
  return INTAKE_FIELDS.filter((f) => f.required && !isFieldFilled(intake[f.key]));
}

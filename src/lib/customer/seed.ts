/**
 * First-run sample customers. Seeded once (guarded by a flag in the store) so a
 * brand-new browser shows a populated dashboard. Deleting all customers will not
 * re-seed. This is demo data only — real data is created by users / the intake
 * form.
 */
import type { ChecklistState, Customer } from "./types";
import { timelineEvent } from "./service";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function completed(ids: string[], by: string, when: string): ChecklistState {
  const state: ChecklistState = {};
  for (const id of ids) state[id] = { done: true, completedAt: when, completedBy: by };
  return state;
}

export function seedCustomers(): Customer[] {
  const sierra: Customer = {
    id: "sierra-air",
    name: "Sierra Air Partners",
    companyName: "Sierra Air Partners, LLC",
    assignedCsm: "Mia Gray",
    portalToken: "demo-sierra-air-portal",
    status: "in_progress",
    intakeSubmitted: true,
    intake: {
      companyName: "Sierra Air Partners, LLC",
      organizationName: "Sierra Air Partners",
      addChildOffices: "Yes",
      childOffices: ["Reno (HQ)", "Sacramento", "Las Vegas"],
      primaryContact: "Dana Okafor, VP Sales",
      email: "dana.okafor@sierraair.com",
      phone: "(775) 412-8830",
      address: "2200 Vassar St, Reno, NV 89502",
      industry: "Manufacturer's Rep",
      crmSystem: "HubSpot",
      emailMethod: "Email Forwarding",
      bidInbox: "bids@sierraair.com",
      teamMembers: [
        { name: "Dana Okafor", email: "dana.okafor@sierraair.com", role: "Admin" },
        { name: "Marcus Feld", email: "marcus@sierraair.com", role: "Admin" },
        { name: "Priya Shah", email: "priya@sierraair.com", role: "Member" },
      ],
      requestedGoLiveDate: daysAgo(-21).slice(0, 10),
      projectNotes: "Six offices across NV/CA. Wants line-card validated with reps before go-live.",
      additionalComments: "Prefers Thursday check-ins.",
      submittedAt: daysAgo(9),
    },
    checklist: {
      ...completed(
        [
          "intake-account-details",
          "intake-signer",
          "intake-it-contact",
          "intake-org-structure",
          "intake-integration-details",
          "intake-catalog-source",
          "org-create-parent",
          "org-create-children",
          "org-apply-settings",
        ],
        "Mia Gray",
        daysAgo(6),
      ),
      "org-verify": { done: true, completedAt: daysAgo(5), completedBy: "Mia Gray", note: "Reviewed tree with Dana." },
    },
    notes: [
      {
        id: "n1",
        body: "Kickoff call went well. Dana will send the rep roster by Friday. IT contact is Marcus (marcus@sierraair.com).",
        category: "meeting",
        author: "Mia Gray",
        createdAt: daysAgo(8),
      },
      {
        id: "n2",
        body: "Waiting on final line-card export before loading Representation catalog.",
        category: "blocker",
        author: "Mia Gray",
        createdAt: daysAgo(4),
      },
    ],
    timeline: [
      timelineEvent("task_completed", "Completed: Verify organization details", { by: "Mia Gray", at: daysAgo(5) }),
      timelineEvent("status_changed", "Status → In Progress", { by: "Mia Gray", at: daysAgo(6) }),
      timelineEvent("intake_submitted", "Intake form submitted", { by: "Sierra Air Partners", at: daysAgo(9) }),
      timelineEvent("intake_sent", "Intake link sent to customer", { by: "Mia Gray", at: daysAgo(11) }),
      timelineEvent("customer_created", "Customer created", { by: "Mia Gray", at: daysAgo(12) }),
    ],
    attachments: [],
    archived: false,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(4),
  };

  const cascade: Customer = {
    id: "cascade-mech",
    name: "Cascade Mechanical Group",
    companyName: "Cascade Mechanical Group, Inc.",
    assignedCsm: "Mackenzie Hoover",
    portalToken: "demo-cascade-mech-portal",
    status: "intake_received",
    intakeSubmitted: true,
    intake: {
      companyName: "Cascade Mechanical Group, Inc.",
      organizationName: "Cascade Mechanical",
      addChildOffices: "No",
      primaryContact: "Priya Venkataraman, Operations Director",
      email: "priya.v@cascademech.com",
      phone: "(503) 987-2214",
      address: "915 SE Grand Ave, Portland, OR 97214",
      industry: "Contractor",
      crmSystem: "Salesforce",
      emailMethod: "Email Forwarding",
      bidInbox: "estimating@cascademech.com",
      teamMembers: [
        { name: "Priya Venkataraman", email: "priya.v@cascademech.com", role: "Admin" },
        { name: "Leah Brooks", email: "leah@cascademech.com", role: "Member" },
      ],
      requestedGoLiveDate: daysAgo(-35).slice(0, 10),
      projectNotes: "Pilot for the estimating team first, expand later.",
      submittedAt: daysAgo(2),
    },
    checklist: {},
    notes: [
      {
        id: "n3",
        body: "Intake just came in. Need to schedule the kickoff and confirm the pilot scope.",
        category: "follow_up",
        author: "Mackenzie Hoover",
        createdAt: daysAgo(2),
      },
    ],
    timeline: [
      timelineEvent("intake_submitted", "Intake form submitted", { by: "Cascade Mechanical Group", at: daysAgo(2) }),
      timelineEvent("intake_sent", "Intake link sent to customer", { by: "Mackenzie Hoover", at: daysAgo(4) }),
      timelineEvent("customer_created", "Customer created", { by: "Mackenzie Hoover", at: daysAgo(4) }),
    ],
    attachments: [],
    archived: false,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(2),
  };

  const vanguard: Customer = {
    id: "vanguard-hvac",
    name: "Vanguard HVAC Distributors",
    companyName: "Vanguard HVAC Distributors",
    assignedCsm: "Ben Lyddane",
    portalToken: "demo-vanguard-hvac-portal",
    status: "not_started",
    intakeSubmitted: false,
    intake: {},
    checklist: {},
    notes: [],
    timeline: [timelineEvent("customer_created", "Customer created", { by: "Ben Lyddane", at: daysAgo(1) })],
    attachments: [],
    archived: false,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  };

  return [sierra, cascade, vanguard];
}

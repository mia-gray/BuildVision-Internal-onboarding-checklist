/**
 * Generates client-ready PDF guides that mirror the BuildVision docs pages
 * (getting-started tabs), embedding the EXACT screenshots used on those pages.
 *
 * Run:  npm run build:guides
 * Output: public/guides/*.pdf  (committed to the repo)
 *
 * Screenshots are read from the sibling `buildvision-docs` repo. The app never
 * runs this script — it only serves the committed PDFs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.resolve(ROOT, "../buildvision-docs/public"); // /email-forwarding + /getting-started live here
const LOGO = path.join(ROOT, "public/brand/wordmark-on-light.png");
const OUT = path.join(ROOT, "public/guides");

const INDIGO = "#4838f8";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const MARGIN = 54;
const PAGE_W = 612;
const CONTENT_W = PAGE_W - MARGIN * 2;

function img(rel) {
  const p = path.join(DOCS, rel);
  if (!fs.existsSync(p)) throw new Error(`Missing screenshot: ${p}`);
  return p;
}

function buildGuide({ file, title, subtitle, intro, overview, steps }) {
  const doc = new PDFDocument({ size: "LETTER", margin: MARGIN, bufferPages: true });
  const stream = fs.createWriteStream(path.join(OUT, file));
  doc.pipe(stream);

  // --- Cover / intro (page 1) ---
  doc.image(LOGO, MARGIN, MARGIN, { width: 150 });
  doc.moveDown(3);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text("CUSTOMER GUIDE", { characterSpacing: 1.5 });
  doc.moveDown(0.4);
  doc.font("Helvetica-Bold").fontSize(24).fillColor(INDIGO).text(title);
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(12).fillColor(MUTED).text(subtitle);
  doc.moveDown(1);
  doc.font("Helvetica").fontSize(11).fillColor(INK).text(intro, { lineGap: 3 });

  if (overview?.length) {
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(INK).text("What you'll do");
    doc.moveDown(0.5);
    overview.forEach((item, i) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(INDIGO).text(`${i + 1}.  `, { continued: true });
      doc.font("Helvetica").fillColor(INK).text(item, { lineGap: 2 });
    });
  }

  // --- One screenshot per page ---
  for (const step of steps) {
    doc.addPage();
    if (step.group) {
      doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text(step.group.toUpperCase(), { characterSpacing: 1.2 });
      doc.moveDown(0.3);
    }
    doc.font("Helvetica-Bold").fontSize(15).fillColor(INDIGO).text(step.heading);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11).fillColor(INK).text(step.body, { lineGap: 3 });
    doc.moveDown(0.8);
    if (step.image) {
      const top = doc.y;
      const maxH = 792 - MARGIN - 40 - top;
      doc.image(img(step.image), MARGIN, top, { fit: [CONTENT_W, Math.max(160, maxH)], align: "center" });
    }
  }

  // --- Footers on every page ---
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.page.margins.bottom = 0; // footer sits below the normal margin
    const y = 792 - 40;
    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor("#e5e7eb").lineWidth(1).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    doc.text("BuildVision  ·  Confidential", MARGIN, y + 8, { width: CONTENT_W / 2, align: "left", lineBreak: false });
    doc.text(`Page ${i + 1} of ${range.count}`, PAGE_W / 2, y + 8, { width: CONTENT_W / 2, align: "right", lineBreak: false });
  }

  doc.end();
  return new Promise((res) => stream.on("finish", () => res(file)));
}

const GUIDES = [
  {
    file: "email-forwarding-guide.pdf",
    title: "Email Forwarding",
    subtitle: "Forward project emails to Bids@BuildVision.io so BuildVision has full context on every bid from day one.",
    intro:
      "When bid invites or contractor emails come in, BuildVision can pull the project details directly — tagging files, extracting schedules, and building the project intelligence you need to quote, without adding work to your day.\n\nBefore you start: Gmail and Outlook send a one-time verification message to Bids@BuildVision.io the first time you add the address — email your CX lead to confirm BuildVision received it. Some Microsoft 365 / Google Workspace accounts disable external forwarding by default (this causes the 5.7.520 bounce); ask your IT/admin to enable external forwarding first.",
    overview: null,
    steps: [
      {
        group: "Gmail / Google Workspace",
        heading: "Step 1 — Open forwarding settings",
        body: "Open Gmail on a desktop browser (the mobile app doesn't support forwarding setup). Click the gear icon, then See all settings.",
        image: "email-forwarding/screenshot-01.png",
      },
      {
        group: "Gmail / Google Workspace",
        heading: "Add & verify the forwarding address",
        body: "Open the Forwarding and POP/IMAP tab. Click Add a forwarding address, enter Bids@BuildVision.io, then Next → Proceed → OK. Gmail sends a verification email; your CX lead confirms it, and the address shows as verified.",
        image: "email-forwarding/screenshot-02.png",
      },
      {
        group: "Gmail / Google Workspace",
        heading: "Step 2 — Create a filter",
        body: "Click the gear icon → See all settings → Filters and Blocked Addresses → Create a new filter. A filter forwards only the messages that match your criteria.",
        image: "email-forwarding/screenshot-03.png",
      },
      {
        group: "Gmail / Google Workspace",
        heading: "Filter for project emails",
        body: "Enter criteria that identify project emails: From a contractor domain (e.g. @contractordomain.com), or Subject with terms like Bid, RFQ, Proposal, Quote. Check Has attachment so BuildVision receives drawings, schedules, and specs.",
        image: "email-forwarding/screenshot-04.png",
      },
      {
        group: "Gmail / Google Workspace",
        heading: "Forward matching mail",
        body: "Click Create filter, then check Forward it to and select Bids@BuildVision.io. Check Also apply filter to matching conversations to send existing project emails so BuildVision has full context from day one. Click Create filter to save.",
        image: "email-forwarding/screenshot-05.png",
      },
      {
        group: "Outlook on the web",
        heading: "Add a rule",
        body: "Open outlook.office.com (or outlook.live.com for personal) and sign in. Go to Settings → Mail → Rules → Add new rule. Name it (e.g. Forward bids to BuildVision) and add a condition: From a contractor/domain, Subject includes Bid/RFQ/Proposal/Quote, or Has attachment.",
        image: "email-forwarding/screenshot-06.png",
      },
      {
        group: "Outlook on the web",
        heading: "Forward to BuildVision",
        body: "Add an action: choose Forward to (not Redirect to), then enter Bids@BuildVision.io. Click Save — the rule applies to new messages immediately.",
        image: "email-forwarding/screenshot-07.png",
      },
      {
        group: "Classic Outlook desktop (Windows)",
        heading: "Create a new rule",
        body: "On the File tab, click Manage Rules & Alerts → New Rule. Choose Apply rule on messages I receive and click Next.",
        image: "email-forwarding/screenshot-08.png",
      },
      {
        group: "Classic Outlook desktop (Windows)",
        heading: "Forward it to BuildVision",
        body: "Select your conditions — from people or public group for contractors, or with specific words in the subject for Bid/RFQ/Proposal/Quote. Check forward it to people or public groups, click the underlined link, type Bids@BuildVision.io, and click OK. Then Finish → Apply.",
        image: "email-forwarding/screenshot-09.png",
      },
    ],
  },
  {
    file: "quick-start.pdf",
    title: "Quick Start for Manufacturer Reps",
    subtitle: "From your home page to your first sent bid, in five steps. About ten minutes end to end.",
    intro:
      "Before you start: your profile and organization should already be set up, including line cards and service areas. If they are not, finish that first. This guide walks you from your home page to your first sent bid.",
    overview: [
      "Get bids flowing in — forward email or upload a document.",
      "Tour your home page — notifications, projects, settings.",
      "Explore the Files tab — see schedule tagging in action.",
      "Submit your first bid — drag and drop your proposal.",
      "Add clients and teammates — loop in your network.",
    ],
    steps: [
      {
        heading: "Step 1 — Get bids flowing in",
        body: "Three ways to feed BuildVision: connect your inbox directly, forward bids from your existing email, or drag and drop a document to try it on something specific first. Pick one path — BuildVision starts processing as soon as a bid arrives.",
        image: "getting-started/step-01-get-started.png",
      },
      {
        heading: "Step 2 — Tour your home page",
        body: "Your home page is where everything surfaces: new projects, files that landed, addenda to review, and overnight extractions. Your three main areas are notifications, the projects list, and settings.",
        image: "getting-started/step-02-home.png",
      },
      {
        heading: "Step 3 — Explore the Equipment tab",
        body: "Open a project to see the equipment BuildVision extracted from the documents — organized and ready to quote against.",
        image: "getting-started/step-03-equipment-tab.png",
      },
      {
        heading: "Step 3 — Files & schedule tagging",
        body: "In the Files tab, each tag points to a schedule in your plans. Click a tag to jump straight to that page with the schedule already highlighted.",
        image: "getting-started/step-03-files-tab.png",
      },
      {
        heading: "Step 3 — Built-in PDF viewer",
        body: "Review the source documents inline, without leaving BuildVision.",
        image: "getting-started/step-03-pdf-viewer.png",
      },
      {
        heading: "Step 4 — Submit your first bid",
        body: "Open the bid list for the project to see what's outstanding.",
        image: "getting-started/step-04-bid-list-1.png",
      },
      {
        heading: "Step 4 — Send your proposal",
        body: "Drag and drop your proposal to submit your bid.",
        image: "getting-started/step-04-bid-list-2.png",
      },
      {
        heading: "Step 5 — Add clients and teammates",
        body: "Loop in your network — assign clients and teammates so the right people are on the right projects.",
        image: "getting-started/step-05-assign.png",
      },
    ],
  },
  {
    file: "access-other-offices.pdf",
    title: "Access Other Offices",
    subtitle: "Switch between your root account and any child office.",
    intro:
      "When you log in to BuildVision you always land in your root account. If you are a user of the parent organization and it has multiple offices, you can switch into any child office from your profile — and switch back at any time.",
    overview: null,
    steps: [
      {
        heading: "Step 1 — Open your profile",
        body: "Click your avatar initials in the bottom-left corner of the sidebar. A panel slides out; select My Profile. Your root account — the organization you always log into first — is shown at the top under Root Account.",
        image: "getting-started/switching-offices-01.png",
      },
      {
        heading: "Step 2 — Switch into an office",
        body: "Inside My Profile you'll see Root Account (your default) and Other Accounts (every child office you can access). Find the office you want and click the arrow on the right of that row — your active account switches immediately. Switch back the same way.",
        image: "getting-started/switching-offices-02.png",
      },
      {
        heading: "Step 3 — Find all offices via Settings",
        body: "For a full list of all offices and subsidiaries, go to Settings → Company. This view shows every office under your root account, including office type, number of users, timezone, and address. The arrow on each row logs you directly into that office.",
        image: "getting-started/switching-offices-03.png",
      },
    ],
  },
];

fs.mkdirSync(OUT, { recursive: true });
const results = await Promise.all(GUIDES.map(buildGuide));
console.log("Generated:", results.join(", "));

/**
 * Generates client-ready PDF guides that mirror the BuildVision docs pages,
 * embedding the EXACT screenshots from the docs site.
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
const DOCS = path.resolve(ROOT, "../buildvision-docs/public/getting-started");
const LOGO = path.join(ROOT, "public/brand/wordmark-on-light.png");
const OUT = path.join(ROOT, "public/guides");

const INDIGO = "#4838f8";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const MARGIN = 54;
const PAGE_W = 612;
const CONTENT_W = PAGE_W - MARGIN * 2;

function img(name) {
  const p = path.join(DOCS, name);
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

  // --- One step per page ---
  for (const step of steps) {
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(15).fillColor(INDIGO).text(step.heading);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(11).fillColor(INK).text(step.body, { lineGap: 3 });
    doc.moveDown(0.8);
    if (step.image) {
      const top = doc.y;
      const maxH = 792 - MARGIN - 40 - top; // leave room for footer
      doc.image(img(step.image), MARGIN, top, { fit: [CONTENT_W, Math.max(160, maxH)], align: "center" });
    }
  }

  // --- Footers on every page ---
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    // Footer sits below the normal bottom margin; zero it so pdfkit doesn't paginate.
    doc.page.margins.bottom = 0;
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
    file: "quick-start.pdf",
    title: "Quick Start for Manufacturer Reps",
    subtitle: "From your home page to your first sent bid, in five steps. About ten minutes end to end.",
    intro:
      "Before you start: your profile and organization should already be set up, including line cards and service areas. If they are not, finish that first. This guide walks you from your home page to your first sent bid.",
    overview: [
      "Get bids flowing in (2 min) — forward email or upload a document.",
      "Tour your home page (1 min) — notifications, projects, settings.",
      "Explore the Files tab (2 min) — see schedule tagging in action.",
      "Submit your first bid (3 min) — drag and drop your proposal.",
      "Add clients and teammates (2 min) — loop in your network.",
    ],
    steps: [
      {
        heading: "Step 1 — Get bids flowing in",
        body: "There are three ways to feed BuildVision: connect your inbox directly, forward bids from your existing email account, or drag and drop a document if you want to try it on something specific first. Pick one path — whichever you choose, BuildVision starts processing as soon as a bid arrives.",
        image: "step-01-get-started.png",
      },
      {
        heading: "Step 2 — Tour your home page",
        body: "Your home page is where everything surfaces: new projects, files that landed, addenda you need to review, and extractions that finished overnight. Your three main areas are notifications, the projects list, and settings.",
        image: "step-02-home.png",
      },
      {
        heading: "Step 3 — Explore the Files tab",
        body: "Open a project's Files tab to see schedule tagging in action. Each tag points to a schedule in your plans; click a tag to jump straight to that page, with the schedule already highlighted.",
        image: "step-03-files-tab.png",
      },
      {
        heading: "Step 4 — Submit your first bid",
        body: "When you are ready, submit your proposal against the project. Review the bid list, then drag and drop your proposal to send it.",
        image: "step-04-bid-list-1.png",
      },
      {
        heading: "Step 5 — Add clients and teammates",
        body: "Loop in your network. Add clients and teammates so the right people are assigned to the right projects.",
        image: "step-05-assign.png",
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
        body: "Click your avatar initials in the bottom-left corner of the sidebar. A panel slides out showing your profile menu; select My Profile. Your root account — the organization you always log into first — is shown at the top under Root Account.",
        image: "switching-offices-01.png",
      },
      {
        heading: "Step 2 — Switch into an office",
        body: "Inside My Profile you will see two sections. The top section, Root Account, is your default. Below it, Other Accounts lists every child office you have access to. Find the office you want and click the arrow on the right of that row — your active account switches to that office immediately. Switch back to your root account the same way.",
        image: "switching-offices-02.png",
      },
      {
        heading: "Step 3 — Find all offices via Settings",
        body: "For a full list of all offices and subsidiaries, go to Settings then Company. This view shows every office under your root account, including the office type, number of users, timezone, and address. The arrow on each row logs you directly into that office.",
        image: "switching-offices-03.png",
      },
    ],
  },
];

fs.mkdirSync(OUT, { recursive: true });
const results = await Promise.all(GUIDES.map(buildGuide));
console.log("Generated:", results.join(", "));

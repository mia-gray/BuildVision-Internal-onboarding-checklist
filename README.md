# Client Onboarding Playbook

An internal, interactive playbook that guides BuildVision's **Customer Success &
Operations** teams through onboarding a new client — from signed contract to
go-live. It replaces a static checklist document with a fast, searchable,
progress-tracking knowledge base.

> Think of it as an interactive playbook, not a PDF: check off tasks, jump around
> with `⌘K`, and pick up exactly where you left off.

---

## Highlights

- **Dashboard** — overall progress ring, per-section progress, recently viewed,
  quick links, copy-snippets, team contacts, key endpoints, 90-day roadmap, and a
  fillable **Client Reference Sheet**.
- **Ordered workflow** — 8 sections in strict dependency order (Intake →
  Organizations → Email Forwarding → Email Connector/CRM → Users → Permissions →
  File Loading → QA & Handoff), each a full SOP with overview, prerequisites,
  step-by-step checklist, verification gates, tips, warnings, common mistakes,
  screenshots, and related links.
- **Interactive checklists** — check off tasks, expand/collapse (individually or
  all), hide-completed filter, mark-all / reset, and hard **verification gates**.
- **Command palette (`⌘K`)** — full-text search across steps, sections, FAQs,
  troubleshooting, resources, and process gaps.
- **Knowledge base** — FAQ, Troubleshooting (Problem / Cause / Resolution /
  Related steps), Resources, and a **Process Gaps** page that flags missing
  documentation with suggested fixes.
- **Progress saved in the browser** (localStorage) — no login, no backend.
- **Bookmarks**, **recently viewed**, **dark mode**, **print-friendly** pages,
  **copy-to-clipboard** snippets, **keyboard shortcuts** (`?` for help), status
  **badges** (Required / Optional / Advanced), and responsive mobile layout.
- **Content-driven** — every word lives in editable JSON under `content/`.
  Non-developers can update procedures or add whole new guides without touching
  application code.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + `tw-animate-css` |
| Components | shadcn/ui-style primitives on Radix UI (customized) |
| Icons | lucide-react |
| Theming | next-themes (light / dark / system) |
| Search | Dependency-free client-side scorer (`src/lib/search.ts`) |
| Content | Local JSON in `content/`, loaded via `node:fs` on the server |

No database or external services are required.

---

## Getting started

**Prerequisites:** Node.js 18.18+ (Node 20+ recommended) and npm.

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure environment
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000>.

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (hot reload). |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Type-check without emitting. |

---

## Project structure

```
client-onboarding-playbook/
├─ content/                     # ← all human-editable content (see content/README.md)
│  ├─ meta.json                 #   app name, contacts, endpoints, reference sheet, snippets, roadmap
│  ├─ sections/*.json           #   one file per checklist section (the core playbook)
│  ├─ faq.json
│  ├─ troubleshooting.json
│  ├─ resources.json
│  └─ process-gaps.json
├─ src/
│  ├─ app/                      # Next.js App Router routes
│  │  ├─ layout.tsx             #   root layout: fonts + providers + app shell
│  │  ├─ page.tsx               #   dashboard
│  │  ├─ sections/[slug]/       #   dynamic section pages (SSG)
│  │  ├─ faq/ troubleshooting/ resources/ process-gaps/
│  │  ├─ globals.css            #   design tokens (light/dark) + Tailwind theme
│  │  └─ not-found.tsx
│  ├─ components/
│  │  ├─ ui/                    #   shadcn-style primitives (button, badge, dialog, …)
│  │  ├─ providers/             #   theme, catalog, progress (localStorage), command palette
│  │  ├─ dashboard/             #   dashboard widgets
│  │  ├─ section/               #   section view + interactive step items
│  │  ├─ faq/ troubleshooting/ resources/
│  │  ├─ app-shell.tsx sidebar.tsx command-palette.tsx keyboard-shortcuts.tsx …
│  └─ lib/
│     ├─ content.ts             #   server-side content loader + search index builder
│     ├─ types.ts               #   the content model (source of truth for shapes)
│     ├─ search.ts icons.ts utils.ts use-stats.ts
├─ .env.example
└─ next.config.ts
```

### How content flows

1. `src/lib/content.ts` reads `content/**` on the server (build + request time).
2. The root layout assembles a serializable **catalog** (including a prebuilt
   search index) and hands it to client components via `CatalogProvider`.
3. Checklist progress, bookmarks, and recently-viewed are stored in the browser
   by `ProgressProvider` (localStorage), so nothing leaves the machine.

---

## Editing content (no code required)

All content is plain JSON in `content/`. See **[`content/README.md`](content/README.md)**
for the full authoring guide. In short:

- **Edit a procedure** → open the relevant `content/sections/*.json`, change the
  text, save. The app updates.
- **Add a new guide** → drop a new file in `content/sections/`, set its `slug`,
  `title`, `icon`, and `order`. It appears in the sidebar automatically.
- **Golden rule:** every step needs a **unique, stable `id`** — progress is saved
  against it, so never rename or reuse an id.

---

## Environment variables

None are required — the app runs entirely against local content. The optional
ones (documented in [`.env.example`](.env.example)):

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical/metadata base URL. |
| `NEXT_PUBLIC_APP_NAME` | No | Override the app name shown in the header/title. |
| `NEXT_PUBLIC_ANALYTICS_KEY` | No | Optional analytics; disabled if blank. |
| `DATABASE_URL`, `AUTH_SECRET` | No | Reserved for future multi-user features (see Roadmap). |

---

## Deployment

The app is a fully static export (`output: "export"` in `next.config.ts`), so it
can be hosted on any static host.

### GitHub Pages (automated — configured)

A workflow at [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
builds the static export and publishes it to GitHub Pages on every push to
`main` (and on demand via **Actions → Deploy to GitHub Pages → Run workflow**).

**One-time setup:**

1. In the repo: **Settings → Pages → Build and deployment → Source = GitHub
   Actions**. (The workflow also attempts to enable this automatically.)
2. Merge to `main` (or run the workflow manually). The site publishes to
   `https://<owner>.github.io/<repo>/` — for this repo,
   `https://mia-gray.github.io/BuildVision-Internal-onboarding-checklist/`.

The workflow derives the sub-path base automatically from the repo name via
`NEXT_PUBLIC_BASE_PATH`, so assets resolve correctly under the Pages sub-path.

> **Note:** GitHub Pages on a **private** repo requires a paid GitHub plan
> (Pro/Team/Enterprise). If the repo is on a free plan, either make it public or
> use one of the other hosting options below.

### Static export anywhere

```bash
npm run build          # writes ./out
npx serve out          # or copy ./out to any static host / internal share
```

For a non-root sub-path, set `NEXT_PUBLIC_BASE_PATH=/your-sub-path` before
building.

### Vercel (optional)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/mia-gray/BuildVision-Internal-onboarding-checklist)

**One-time connection (gives you automatic preview + production deploys):**

1. Go to <https://vercel.com/new> and **Import** the
   `mia-gray/BuildVision-Internal-onboarding-checklist` repo (authorize Vercel for
   the GitHub account/org if prompted — the repo is private).
2. Framework preset: **Next.js** (auto-detected). Build command `next build`,
   output handled automatically. **No environment variables are required.**
3. Click **Deploy**.

After this one-time link, Vercel deploys automatically:

- **Production** — every push/merge to `main` → your production URL.
- **Preview** — **every pull request gets its own preview URL**, posted as a
  check on the PR. Reviewers can click through the exact change before merge.

Because content is bundled at build time, editing a `content/*.json` file and
pushing triggers a fresh deploy with the new content.

**CLI alternative** (if you prefer the terminal):

```bash
npm i -g vercel
vercel login          # interactive, one time
vercel link           # link this folder to a Vercel project
vercel                # deploy a preview
vercel --prod         # deploy to production
```

### Any static host / internal server

Because the build produces a plain static bundle in `./out`, you can serve it
from an internal web server, an S3 bucket, a shared drive with a static host,
Nginx, etc.:

```bash
npm ci
npm run build     # writes ./out
# then serve ./out with any static file server, e.g.:
npx serve out
```

> Because content is bundled at build time, editing a `content/*.json` file and
> rebuilding produces an updated bundle.

---

## Creating the GitHub repository

This project is initialized as a local git repo with an initial commit. To create
the remote and push:

**With the GitHub CLI (`gh`):**

```bash
gh repo create client-onboarding-playbook --private --source=. --remote=origin --push
```

**Without `gh`:** create an empty repo named `client-onboarding-playbook` at
<https://github.com/new> (do not add a README), then:

```bash
git remote add origin https://github.com/<your-org>/client-onboarding-playbook.git
git branch -M main
git push -u origin main
```

---

## Accessibility & quality

- Semantic landmarks, labeled controls, keyboard-operable palette and menus,
  visible focus rings, and `aria-current` on active navigation.
- Respects `prefers-color-scheme`; dark mode is first-class.
- Strict TypeScript, reusable components, and a single content model in
  `src/lib/types.ts`.

---

## Roadmap & extension points

Deliberately built to grow:

- **Multi-user progress / shared sign-off** — swap `ProgressProvider`'s
  localStorage for an API (wire `DATABASE_URL` / `AUTH_SECRET`).
- **Admin editing UI** — the JSON content model is ready for a CMS or in-app
  editor.
- **Version history** — content is plain JSON in git, so history is already
  tracked; surface diffs in-app when needed.
- **Real screenshots** — drop images in `public/screenshots/` and reference them
  from a section's `screenshots[].src`.

See the in-app **Process Gaps** page for onboarding-process improvements flagged
from the source material.

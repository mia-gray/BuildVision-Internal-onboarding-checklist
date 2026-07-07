# Content authoring guide

**You do not need to be a developer to update this playbook.** All content lives
in this `content/` folder as plain JSON. Edit a file, save, and the app updates.

> Tip: JSON is picky about commas and quotes. After editing, paste your file
> into a JSON validator (e.g. jsonlint.com) if the app shows an error.

## Where things live

| File | What it controls |
| --- | --- |
| `meta.json` | App name, team contacts, endpoints, the Reference Sheet fields, copy-snippets, and the 90-day roadmap. |
| `sections/*.json` | One file per checklist section (Intake, Organization Creation, …). This is the core playbook. |
| `faq.json` | Frequently asked questions. |
| `troubleshooting.json` | Problem / Cause / Resolution / Related steps. |
| `resources.json` | Links, docs, templates, videos, SOPs. |
| `process-gaps.json` | Documentation gaps flagged from the source, with suggested fixes. |

## Editing a section

Open any file in `sections/`. The important fields:

- `title`, `summary`, `overview` — headline, one-liner, and intro (Markdown allowed in `overview`).
- `estimatedTime`, `prerequisites`, `tips`, `warnings`, `commonMistakes` — the context blocks.
- `steps` — the interactive checklist. **Each step needs a unique, stable `id`.**
  Users' checked-off progress is saved against that `id`, so **never rename or
  reuse an id** — that would reset or mix up saved progress. To retire a step,
  remove it; to add one, invent a brand-new id.
- `related`, `screenshots` — cross-links and image captions.

### Step callouts

Inside a step you can add colored callouts:

```json
"callouts": [
  { "type": "tip", "text": "..." },
  { "type": "warning", "text": "..." },
  { "type": "blocker", "text": "..." },
  { "type": "verify", "text": "..." },
  { "type": "info", "text": "..." }
]
```

## Adding a brand-new section

1. Copy an existing file in `sections/` to a new name, e.g. `sections/billing-setup.json`.
2. Change `slug` (URL), `title`, `icon`, and `order` (lower = earlier in the sidebar).
3. Give every step a unique `id`.
4. Save. The section appears automatically — no code change required.

Valid `icon` values are Lucide icon names registered in `src/lib/icons.ts`
(e.g. `Building2`, `Forward`, `UserPlus`). If you use one that isn't registered,
a default icon is shown — ask a developer to add it to the registry.

## Adding screenshots

Put image files in `public/screenshots/` and reference them:

```json
"screenshots": [
  { "src": "/screenshots/org-tree.png", "caption": "The org hierarchy." }
]
```

Omit `src` to render a labeled placeholder (useful before the real image exists).

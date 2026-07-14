# Backend setup (Supabase)

By default this app stores everything in the **current browser** (localStorage) —
great for a single person, but customer links you email don't work for the
recipient, because their browser has none of your data.

Turning on the Supabase backend fixes that:

- Customers, intake, progress, notes, and documents live in a **shared database**.
- Your data syncs across **all your devices**.
- **Intake and portal links work for clients** — they load that one customer by
  the token in the link, and their intake comes back to you.
- The internal dashboard is protected by a **team email/password login** (so the
  public site can't expose your customer data).

You only need to do this once. ~15 minutes.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com> → sign in → **New project**.
2. Give it a name (e.g. `buildvision-onboarding`), set a database password
   (save it somewhere), pick a region near you, and create it.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Create the database

1. In the project, open **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this repo, copy the
   whole file, paste it in, and click **Run**. You should see "Success".

This creates the `customers` table, locks it down with row-level security, and
adds the token-scoped functions the client portal/intake use.

## 3. Turn on email/password login (team only)

1. **Authentication → Providers → Email**: make sure **Email** is enabled and
   **Confirm email** is turned **off** (simplest for an internal team).
2. **Authentication → Sign-ups**: **disable new sign-ups** so only accounts you
   create can log in.
3. **Authentication → Users → Add user** — create one for each teammate
   (email + password). Share each password with that person; they can change it
   later. Start with:
   - mia@buildvision.io
   - (Ben's email)
   - (Mackenzie's email)

## 4. Copy your keys

**Project Settings → API**, copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **`anon` `public`** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> ⚠️ Both of these are **public** and safe to share/commit as build config.
> **Never** use the **`service_role`** key in this app or paste it anywhere — it
> bypasses all security.

## 5. Point the live site at Supabase

In GitHub: **repo → Settings → Secrets and variables → Actions → New repository
secret**, add both:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then **Actions → Deploy to GitHub Pages → Run workflow** (or push any commit) to
rebuild. Once it finishes, the live site uses the backend and shows the team
login.

## 6. (Optional) Run it locally against Supabase

```bash
cp .env.example .env.local
# then edit .env.local and set:
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
npm run dev
```

---

## How it behaves

| | No Supabase (default) | With Supabase |
| --- | --- | --- |
| Storage | This browser only | Shared database |
| Team login | None | Required (email/password) |
| Client intake/portal links | Only work in your browser | Work for anyone with the link |
| Sample customers | Seeded on first run | Not seeded (real data only) |

## Notes & limits

- **Existing localStorage customers don't migrate automatically.** Anything you
  created before turning on Supabase lives only in that browser. Re-create the
  real ones (there usually aren't many), or ask and we can add a one-time import.
- **Portal is read-only for clients** — it shows the progress your team records.
  Clients can't check items off (by design).
- Turning the secrets back off reverts the site to localStorage mode.

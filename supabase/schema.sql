-- BuildVision onboarding — Supabase schema
-- Run this once in your Supabase project: SQL Editor → paste → Run.
-- Safe to re-run (uses "if not exists" / "or replace").

-- ---------------------------------------------------------------------------
-- Table: one row per customer. The full Customer object lives in `data`
-- (jsonb); a few columns are lifted out for indexing, ordering, and security.
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id           text primary key,
  portal_token text unique not null,
  archived     boolean not null default false,
  data         jsonb not null,
  updated_at   timestamptz not null default now()
);

create index if not exists customers_portal_token_idx on public.customers (portal_token);
create index if not exists customers_updated_at_idx on public.customers (updated_at desc);

-- ---------------------------------------------------------------------------
-- Row-level security: the table is private. Only signed-in team members can
-- read/write it directly. Anonymous clients NEVER touch the table — they use
-- the scoped RPC functions below.
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;

drop policy if exists "team_select" on public.customers;
drop policy if exists "team_insert" on public.customers;
drop policy if exists "team_update" on public.customers;
drop policy if exists "team_delete" on public.customers;

create policy "team_select" on public.customers for select
  using (auth.role() = 'authenticated');
create policy "team_insert" on public.customers for insert
  with check (auth.role() = 'authenticated');
create policy "team_update" on public.customers for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "team_delete" on public.customers for delete
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Anonymous, token-scoped access for the customer-facing portal + intake form.
-- These run with the definer's privileges and return ONLY the one relevant
-- row — the table itself stays locked to anon.
-- ---------------------------------------------------------------------------

-- Portal: return a SANITIZED customer for a portal token. Internal-only fields
-- (notes, timeline, unshared attachments) are stripped server-side, so they can
-- never reach the client even via the network response.
create or replace function public.portal_get(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',              data->'id',
    'name',            data->'name',
    'companyName',     data->'companyName',
    'logoUrl',         data->'logoUrl',
    'assignedCsm',     data->'assignedCsm',
    'status',          data->'status',
    'intake',          data->'intake',
    'intakeSubmitted', data->'intakeSubmitted',
    'checklist',       data->'checklist',
    'createdAt',       data->'createdAt',
    'updatedAt',       data->'updatedAt',
    'attachments', (
      select coalesce(jsonb_agg(a), '[]'::jsonb)
      from jsonb_array_elements(coalesce(data->'attachments', '[]'::jsonb)) a
      where (a->>'sharedWithCustomer')::boolean is true
    )
  )
  from public.customers
  where portal_token = p_token and archived = false;
$$;

-- Intake: minimal info needed to render the form for a given customer id.
create or replace function public.intake_get(p_id text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',              data->'id',
    'name',            data->'name',
    'companyName',     data->'companyName',
    'intake',          data->'intake',
    'intakeSubmitted', data->'intakeSubmitted'
  )
  from public.customers
  where id = p_id and archived = false;
$$;

-- Intake: submit the form — merge answers and mark submitted. Returns nothing.
create or replace function public.intake_submit(p_id text, p_intake jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.customers
  set data = jsonb_set(
               jsonb_set(data, '{intake}', p_intake, true),
               '{intakeSubmitted}', 'true'::jsonb, true
             ),
      updated_at = now()
  where id = p_id and archived = false;
end;
$$;

-- Expose only the RPCs to anonymous visitors.
grant execute on function public.portal_get(text)          to anon, authenticated;
grant execute on function public.intake_get(text)          to anon, authenticated;
grant execute on function public.intake_submit(text, jsonb) to anon, authenticated;

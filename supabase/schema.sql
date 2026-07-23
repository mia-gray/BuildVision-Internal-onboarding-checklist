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
    'portalToken',     to_jsonb(portal_token),
    'name',            data->'name',
    'companyName',     data->'companyName',
    'logoUrl',         data->'logoUrl',
    'assignedCsm',     data->'assignedCsm',
    'status',          data->'status',
    'intake',          data->'intake',
    'intakeSubmitted', data->'intakeSubmitted',
    'checklist',       data->'checklist',
    'reward',          data->'reward',
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

-- Intake: submit the form — merge answers, mark submitted, advance status,
-- stamp submittedAt/updatedAt, and add a timeline entry so the submission
-- clearly surfaces on the employee dashboard.
create or replace function public.intake_submit(p_id text, p_intake jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_data jsonb;
  v_event jsonb;
begin
  select data into v_data from public.customers where id = p_id and archived = false;
  if v_data is null then return; end if;

  v_data := jsonb_set(v_data, '{intake}', p_intake || jsonb_build_object('submittedAt', to_jsonb(v_now)), true);
  v_data := jsonb_set(v_data, '{intakeSubmitted}', 'true'::jsonb, true);
  v_data := jsonb_set(v_data, '{updatedAt}', to_jsonb(v_now), true);
  if (v_data->>'status') = 'not_started' then
    v_data := jsonb_set(v_data, '{status}', '"intake_received"'::jsonb, true);
  end if;

  v_event := jsonb_build_object(
    'id',    gen_random_uuid()::text,
    'type',  'intake_submitted',
    'label', 'Intake form submitted',
    'by',    coalesce(v_data->>'name', 'Customer'),
    'at',    to_jsonb(v_now)
  );
  v_data := jsonb_set(v_data, '{timeline}',
              jsonb_build_array(v_event) || coalesce(v_data->'timeline', '[]'::jsonb), true);

  update public.customers set data = v_data, updated_at = v_now where id = p_id;
end;
$$;

-- Portal: let the customer check a step on/off. Token-scoped; records that the
-- customer completed it. Only touches that one customer's checklist.
create or replace function public.portal_toggle_step(p_token text, p_step_id text, p_done boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
begin
  update public.customers
  set data = jsonb_set(
        jsonb_set(
          data,
          array['checklist', p_step_id],
          case when p_done then
            jsonb_build_object('done', true, 'completedAt', to_jsonb(v_now), 'completedBy', to_jsonb('Customer'::text))
          else
            jsonb_build_object('done', false)
          end,
          true
        ),
        '{updatedAt}', to_jsonb(v_now), true
      ),
      updated_at = v_now
  where portal_token = p_token and archived = false;
end;
$$;

-- Portal: claim the onboarding reward. Token-scoped; stores the selection +
-- fulfillment details and adds a timeline event so the CX team is notified.
create or replace function public.portal_claim_reward(p_token text, p_reward jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_data jsonb;
  v_choice text;
  v_label text;
  v_event jsonb;
begin
  select data into v_data from public.customers where portal_token = p_token and archived = false;
  if v_data is null then return; end if;

  v_choice := coalesce(p_reward->>'choice', 'reward');
  v_label := case v_choice
    when 'hat' then 'BuildVision Hat'
    when 'tumbler' then 'BuildVision Tumbler'
    when 'doordash' then '$15 DoorDash Gift Card'
    else 'reward' end;

  v_data := jsonb_set(v_data, '{reward}', p_reward || jsonb_build_object('submittedAt', to_jsonb(v_now)), true);
  v_data := jsonb_set(v_data, '{updatedAt}', to_jsonb(v_now), true);

  v_event := jsonb_build_object(
    'id',     gen_random_uuid()::text,
    'type',   'reward_claimed',
    'label',  'Reward claimed: ' || v_label,
    'detail', coalesce(p_reward->>'email', p_reward->>'name'),
    'by',     coalesce(v_data->>'name', 'Customer'),
    'at',     to_jsonb(v_now)
  );
  v_data := jsonb_set(v_data, '{timeline}',
              jsonb_build_array(v_event) || coalesce(v_data->'timeline', '[]'::jsonb), true);

  update public.customers set data = v_data, updated_at = v_now where portal_token = p_token;
end;
$$;

-- Expose only the RPCs to anonymous visitors.
grant execute on function public.portal_get(text)                         to anon, authenticated;
grant execute on function public.intake_get(text)                         to anon, authenticated;
grant execute on function public.intake_submit(text, jsonb)               to anon, authenticated;
grant execute on function public.portal_toggle_step(text, text, boolean)  to anon, authenticated;
grant execute on function public.portal_claim_reward(text, jsonb)         to anon, authenticated;

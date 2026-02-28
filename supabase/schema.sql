-- RiWeb MVP schema: leads, audits, reports
-- Public (anon) can INSERT. Authenticated users can SELECT/UPDATE/DELETE.

-- Extensions (uuid generation)
create extension if not exists "pgcrypto";

-- =========================
-- 1) LEADS
-- =========================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  url text not null,
  locale text not null default 'en' check (locale in ('en', 'es')),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'lost')),
  notes text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_url_idx on public.leads (url);

-- =========================
-- 2) AUDITS
-- =========================
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  url text not null,
  fetched_at timestamptz not null default now(),
  tech jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  score_total int not null default 0 check (score_total between 0 and 100)
);

create index if not exists audits_lead_id_idx on public.audits (lead_id);
create index if not exists audits_fetched_at_idx on public.audits (fetched_at desc);

-- =========================
-- 3) REPORTS
-- =========================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'es')),
  summary text not null default '',
  opportunities jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_lead_id_idx on public.reports (lead_id);
create index if not exists reports_audit_id_idx on public.reports (audit_id);
create index if not exists reports_created_at_idx on public.reports (created_at desc);

-- =========================
-- RLS ENABLE
-- =========================
alter table public.leads enable row level security;
alter table public.audits enable row level security;
alter table public.reports enable row level security;

-- =========================
-- POLICIES
-- Strategy MVP:
-- - Public (anon) can INSERT into leads/audits/reports
-- - Authenticated can SELECT/UPDATE/DELETE all rows (admin console)
-- =========================

-- ---- LEADS policies ----
drop policy if exists "public_insert_leads" on public.leads;
create policy "public_insert_leads"
on public.leads
for insert
to anon
with check (true);

drop policy if exists "auth_select_leads" on public.leads;
create policy "auth_select_leads"
on public.leads
for select
to authenticated
using (true);

drop policy if exists "auth_update_leads" on public.leads;
create policy "auth_update_leads"
on public.leads
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_leads" on public.leads;
create policy "auth_delete_leads"
on public.leads
for delete
to authenticated
using (true);

-- ---- AUDITS policies ----
drop policy if exists "public_insert_audits" on public.audits;
create policy "public_insert_audits"
on public.audits
for insert
to anon
with check (true);

drop policy if exists "auth_select_audits" on public.audits;
create policy "auth_select_audits"
on public.audits
for select
to authenticated
using (true);

drop policy if exists "auth_update_audits" on public.audits;
create policy "auth_update_audits"
on public.audits
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_audits" on public.audits;
create policy "auth_delete_audits"
on public.audits
for delete
to authenticated
using (true);

-- ---- REPORTS policies ----
drop policy if exists "public_insert_reports" on public.reports;
create policy "public_insert_reports"
on public.reports
for insert
to anon
with check (true);

drop policy if exists "auth_select_reports" on public.reports;
create policy "auth_select_reports"
on public.reports
for select
to authenticated
using (true);

drop policy if exists "auth_update_reports" on public.reports;
create policy "auth_update_reports"
on public.reports
for update
to authenticated
using (true)
with check (true);

drop policy if exists "auth_delete_reports" on public.reports;
create policy "auth_delete_reports"
on public.reports
for delete
to authenticated
using (true);

-- =========================
-- Optional: tighten public inserts (anti-spam) later
-- - add Turnstile token verification via Edge Function
-- - move inserts behind server endpoint
-- =========================

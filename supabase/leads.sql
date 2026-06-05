create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  roll_number text,
  enrolled_at timestamptz,
  constraint leads_status_check check (
    status in ('new', 'contacted', 'converted', 'registered', 'enrolled', 'discontinued', 'declined')
  )
);

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check check (
  status in ('new', 'contacted', 'converted', 'registered', 'enrolled', 'discontinued', 'declined')
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_email_lower_idx on public.leads (lower(email));

create table if not exists public.roll_meta (
  id integer primary key,
  yearly_counters jsonb not null default '{}'::jsonb
);

insert into public.roll_meta (id, yearly_counters)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.leads enable row level security;
alter table public.roll_meta enable row level security;

-- Temporary development policies for the frontend anon key while admin auth
-- is still the local demo login. Tighten these before production by replacing
-- admin auth with Supabase Auth/admin roles.
create policy "Temporary allow frontend lead management"
on public.leads for all
to anon, authenticated
using (true)
with check (true);

create policy "Temporary allow frontend roll metadata management"
on public.roll_meta for all
to anon, authenticated
using (true)
with check (true);

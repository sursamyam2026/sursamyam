create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time,
  event_end_date date,
  event_end_time time,
  home_popup_start_date date,
  venue text,
  description text,
  poster_src text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_event_date_idx
on public.events (event_date asc);

create index if not exists events_created_at_idx
on public.events (created_at desc);

alter table public.events
add column if not exists event_time time;

alter table public.events
add column if not exists event_end_date date;

alter table public.events
add column if not exists event_end_time time;

alter table public.events
add column if not exists home_popup_start_date date;

alter table public.events enable row level security;

drop policy if exists "Public can read published events" on public.events;
drop policy if exists "Admins can manage events" on public.events;

create policy "Public can read published events"
on public.events for select
to anon, authenticated
using (is_published = true or public.is_admin());

create policy "Admins can manage events"
on public.events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

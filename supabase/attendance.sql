create extension if not exists pgcrypto;

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_date date not null,
  class_day text,
  class_time time not null,
  course_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sessions_unique unique (class_date, class_time)
);

create index if not exists class_sessions_date_time_idx
on public.class_sessions (class_date desc, class_time desc);

create unique index if not exists class_sessions_date_time_unique_idx
on public.class_sessions (class_date, class_time);

alter table public.class_sessions
add column if not exists class_day text;

update public.class_sessions
set class_day = trim(to_char(class_date, 'Day'))
where class_day is null or trim(class_day) = '';

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  lead_id uuid not null references public.leads(id) on delete cascade,
  status text not null default 'present',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_roster (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint class_roster_session_lead_unique unique (session_id, lead_id)
);

alter table public.attendance_records
add column if not exists session_id uuid;

alter table public.attendance_records
add column if not exists status text not null default 'present';

alter table public.attendance_records
add column if not exists notes text;

alter table public.attendance_records
add column if not exists created_at timestamptz not null default now();

alter table public.attendance_records
add column if not exists updated_at timestamptz not null default now();

-- Migrate rows from the earlier date-only attendance table, if it exists.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attendance_records'
      and column_name = 'class_date'
  ) then
    insert into public.class_sessions (class_date, class_time, course_type)
    select distinct class_date, time '17:00', 'General'
    from public.attendance_records
    where class_date is not null
    on conflict (class_date, class_time) do nothing;

    update public.attendance_records records
    set session_id = sessions.id
    from public.class_sessions sessions
    where records.session_id is null
      and records.class_date = sessions.class_date
      and sessions.class_time = time '17:00'
      and sessions.course_type = 'General';
  end if;
end $$;

alter table public.attendance_records
alter column session_id set not null;

alter table public.attendance_records
drop constraint if exists attendance_records_lead_date_unique;

alter table public.attendance_records
drop constraint if exists attendance_records_status_check;

alter table public.attendance_records
add constraint attendance_records_status_check check (status in ('present', 'absent'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_session_id_fkey'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
    add constraint attendance_records_session_id_fkey
    foreign key (session_id) references public.class_sessions(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_session_lead_unique'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
    add constraint attendance_records_session_lead_unique unique (session_id, lead_id);
  end if;
end $$;

create index if not exists attendance_records_session_id_idx
on public.attendance_records (session_id);

create index if not exists attendance_records_lead_id_idx
on public.attendance_records (lead_id);

create index if not exists class_roster_session_id_idx
on public.class_roster (session_id);

create index if not exists class_roster_lead_id_idx
on public.class_roster (lead_id);

alter table public.class_sessions enable row level security;
alter table public.class_roster enable row level security;
alter table public.attendance_records enable row level security;

drop policy if exists "Admins can manage class sessions" on public.class_sessions;
drop policy if exists "Admins can manage class roster" on public.class_roster;
drop policy if exists "Admins can manage attendance records" on public.attendance_records;

create policy "Admins can manage class sessions"
on public.class_sessions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage class roster"
on public.class_roster for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage attendance records"
on public.attendance_records for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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
    status in ('new', 'contacted', 'converted', 'registered', 'enrolled', 'declined')
  )
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

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  src text not null,
  description text,
  source text not null default 'upload',
  created_at timestamptz not null default now(),
  constraint gallery_images_source_check check (source in ('seed', 'upload'))
);

create index if not exists gallery_images_created_at_idx
on public.gallery_images (created_at desc);

create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  phone text,
  age text,
  city text,
  country text,
  enrollment_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('admin'))
);

alter table public.leads enable row level security;
alter table public.roll_meta enable row level security;
alter table public.gallery_images enable row level security;
alter table public.student_profiles enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
  );
$$;

create or replace function public.submit_contact_lead(
  p_name text,
  p_email text,
  p_phone text default null,
  p_message text default ''
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads;
begin
  insert into public.leads (name, email, phone, message, status)
  values (
    trim(coalesce(p_name, '')),
    lower(trim(coalesce(p_email, ''))),
    nullif(trim(coalesce(p_phone, '')), ''),
    trim(coalesce(p_message, '')),
    'new'
  )
  returning * into v_lead;

  return v_lead;
end;
$$;

create or replace function public.finalize_enrollment_lead(
  p_email text,
  p_name text,
  p_phone text default null,
  p_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_existing_message text;
begin
  select id, message
  into v_id, v_existing_message
  from public.leads
  where lower(email) = lower(trim(coalesce(p_email, '')))
  order by created_at desc
  limit 1;

  if v_id is null then
    insert into public.leads (name, email, phone, message, status)
    values (
      trim(coalesce(p_name, '')),
      lower(trim(coalesce(p_email, ''))),
      nullif(trim(coalesce(p_phone, '')), ''),
      trim(coalesce(p_note, '')),
      'registered'
    );
  else
    update public.leads
    set
      name = coalesce(nullif(trim(coalesce(p_name, '')), ''), name),
      phone = coalesce(nullif(trim(coalesce(p_phone, '')), ''), phone),
      message = case
        when trim(coalesce(message, '')) = '' then trim(coalesce(p_note, ''))
        else trim(message) || E'\n\n' || trim(coalesce(p_note, ''))
      end,
      status = 'registered'
    where id = v_id;
  end if;
end;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.submit_contact_lead(text, text, text, text) to anon, authenticated;
grant execute on function public.finalize_enrollment_lead(text, text, text, text) to anon, authenticated;

drop policy if exists "Temporary allow frontend lead management" on public.leads;
drop policy if exists "Temporary allow frontend roll metadata management" on public.roll_meta;
drop policy if exists "Temporary allow public gallery reads" on public.gallery_images;
drop policy if exists "Temporary allow frontend gallery management" on public.gallery_images;
drop policy if exists "Admins can manage leads" on public.leads;
drop policy if exists "Admins can manage roll metadata" on public.roll_meta;
drop policy if exists "Public can read gallery images" on public.gallery_images;
drop policy if exists "Admins can manage gallery images" on public.gallery_images;
drop policy if exists "Students can read own profile" on public.student_profiles;
drop policy if exists "Students can update own profile" on public.student_profiles;
drop policy if exists "Students can insert own profile" on public.student_profiles;
drop policy if exists "Admins can read admin records" on public.admin_users;

create policy "Admins can manage leads"
on public.leads for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage roll metadata"
on public.roll_meta for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read gallery images"
on public.gallery_images for select
to anon, authenticated
using (true);

create policy "Admins can manage gallery images"
on public.gallery_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Student profiles are prepared for the later Supabase Auth phase.
create policy "Students can read own profile"
on public.student_profiles for select
to authenticated
using (auth.uid() = id);

create policy "Students can update own profile"
on public.student_profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Students can insert own profile"
on public.student_profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Admins can read admin records"
on public.admin_users for select
to authenticated
using (auth.uid() = id);

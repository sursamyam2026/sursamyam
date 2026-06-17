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

create table if not exists public.exam_registrations (
  id uuid primary key default gen_random_uuid(),
  roll_number text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists exam_registrations_roll_number_lower_idx
on public.exam_registrations (lower(roll_number));

create index if not exists exam_registrations_created_at_idx
on public.exam_registrations (created_at desc);

alter table public.gallery_images enable row level security;
alter table public.events enable row level security;
alter table public.exam_registrations enable row level security;

create or replace function public.find_exam_registration(p_roll_number text)
returns public.exam_registrations
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select registration
      from public.exam_registrations registration
      where lower(registration.roll_number) = lower(trim(coalesce(p_roll_number, '')))
      order by registration.created_at desc
      limit 1
    ),
    null::public.exam_registrations
  );
$$;

create or replace function public.submit_exam_registration(p_roll_number text)
returns public.exam_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration public.exam_registrations;
begin
  select *
  into v_registration
  from public.exam_registrations
  where lower(roll_number) = lower(trim(coalesce(p_roll_number, '')))
  limit 1;

  if v_registration.id is not null then
    return null::public.exam_registrations;
  end if;

  insert into public.exam_registrations (roll_number)
  values (trim(coalesce(p_roll_number, '')))
  returning * into v_registration;

  return v_registration;
end;
$$;

grant execute on function public.find_exam_registration(text) to anon, authenticated;
grant execute on function public.submit_exam_registration(text) to anon, authenticated;

drop policy if exists "Public can read gallery images" on public.gallery_images;
drop policy if exists "Admins can manage gallery images" on public.gallery_images;
drop policy if exists "Public can read published events" on public.events;
drop policy if exists "Admins can manage events" on public.events;
drop policy if exists "Admins can manage exam registrations" on public.exam_registrations;

create policy "Public can read gallery images"
on public.gallery_images for select
to anon, authenticated
using (true);

create policy "Admins can manage gallery images"
on public.gallery_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read published events"
on public.events for select
to anon, authenticated
using (is_published = true or public.is_admin());

create policy "Admins can manage events"
on public.events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage exam registrations"
on public.exam_registrations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

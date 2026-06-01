create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('admin'))
);

alter table public.leads enable row level security;
alter table public.roll_meta enable row level security;
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
drop policy if exists "Admins can manage leads" on public.leads;
drop policy if exists "Admins can manage roll metadata" on public.roll_meta;
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

create policy "Admins can read admin records"
on public.admin_users for select
to authenticated
using (auth.uid() = id);

# Supabase Setup

## Create The Cloud Project

Create a Supabase project from the dashboard, then copy:

- Project URL
- anon public key

Do not use the service role key in this frontend app.

## Create Tables

In Supabase Dashboard:

1. Open SQL Editor.
2. Paste `supabase/schema.sql`.
3. Run it.

`supabase/leads.sql` is the smaller phase-1-only script. `supabase/schema.sql`
contains the wider planned schema for leads, gallery, students, and admins.

If you already ran the leads/admin scripts and only need gallery plus exam
registrations, run:

```text
supabase/gallery-exams.sql
```

## Configure The App

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

Restart the Vite dev server after changing env vars.

## Current Security State

Admin login is now designed to use Supabase Auth.

To create the first admin:

1. In Supabase Dashboard, open Authentication.
2. Create a user with email/password.
3. Copy that user's UUID.
4. Insert the user into `admin_users`:

```sql
insert into public.admin_users (id, email, role)
values ('AUTH_USER_UUID', 'admin@example.com', 'admin')
on conflict (id) do nothing;
```

If you previously ran the temporary phase-1 schema, run `supabase/admin-auth.sql`
in SQL Editor to add the admin policies and public lead RPC functions.

If the admin status dropdown shows "Unable to update lead" when selecting
Discontinued, run `supabase/discontinued-status.sql` once in SQL Editor to update
the existing lead status constraint.

To add attendance tracking to an existing Supabase project, run
`supabase/attendance.sql` once in SQL Editor after admin auth is configured.

## Gallery And Exam Registrations

Gallery metadata is stored in `gallery_images`. The current app stores uploaded
image data URLs in the `src` column, preserving the existing upload flow. Moving
binary files to Supabase Storage can be done later if upload size becomes a
concern.

Exam registrations are stored in `exam_registrations`. Public users submit roll
numbers through RPC functions; admins read and delete registrations through RLS.

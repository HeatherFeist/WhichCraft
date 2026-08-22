-- WhichCraft: initial schema
-- Covers: member profiles/tiers, Host a Party applications, and the
-- Spotlight submission + community-voting funnel.
--
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- (Or via CLI: supabase db push, from a machine with normal internet access.)

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
create type membership_tier as enum ('spark', 'circle', 'studio');
create type host_application_status as enum ('pending', 'approved', 'declined', 'completed');
create type spotlight_status as enum ('submitted', 'shortlisted', 'rejected', 'invited');

-- ============================================================
-- profiles
-- One row per member, keyed to their Supabase Auth account.
-- membership_tier is the source of truth for what a member can do
-- (host, submit to Spotlight, vote). Until billing is wired to update
-- this automatically (e.g. a Stripe webhook), Heather/Linda update it
-- by hand from Table Editor -> profiles after confirming payment.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  membership_tier membership_tier not null default 'spark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Members can see and update their own profile only.
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- A new profile row is created automatically when someone signs up
-- (see the trigger below), so there's no public insert policy here.

-- Auto-create a profile row whenever a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- host_applications
-- "Host a Party" applications. Open to anyone to submit (member or
-- not) since the site invites non-members to apply and upgrade -
-- review/approval happens by Heather/Linda from Table Editor.
-- ============================================================
create table public.host_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  group_size text not null,
  preferred_date text,
  craft_preference text,
  status host_application_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.host_applications enable row level security;

-- Anyone (including anonymous site visitors) can submit an application.
create policy "host_applications: anyone can submit"
  on public.host_applications for insert
  with check (true);

-- Applicants can see their own submitted applications, if signed in.
create policy "host_applications: read own"
  on public.host_applications for select
  using (auth.uid() = profile_id);

-- ============================================================
-- spotlight_submissions
-- Circle+ members submit a video link. Heather/Linda shortlist from
-- Table Editor by updating `status`. Only shortlisted submissions
-- should be shown for voting in the app UI.
-- ============================================================
create table public.spotlight_submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  craft_title text not null,
  video_link text not null,
  notes text,
  status spotlight_status not null default 'submitted',
  created_at timestamptz not null default now()
);

alter table public.spotlight_submissions enable row level security;

-- Only Circle or Studio members can submit.
create policy "spotlight_submissions: circle+ can submit"
  on public.spotlight_submissions for insert
  with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and membership_tier in ('circle', 'studio')
    )
  );

-- Anyone signed in can read shortlisted/invited submissions (what the
-- voting UI shows); submitters can also read their own regardless of
-- status, to track where their submission stands.
create policy "spotlight_submissions: read shortlisted or own"
  on public.spotlight_submissions for select
  using (
    status in ('shortlisted', 'invited')
    or auth.uid() = profile_id
  );

-- ============================================================
-- spotlight_votes
-- One vote per member per submission, enforced by the unique
-- constraint below (not just app-level logic).
-- ============================================================
create table public.spotlight_votes (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.spotlight_submissions (id) on delete cascade,
  voter_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (submission_id, voter_id)
);

alter table public.spotlight_votes enable row level security;

-- Only Circle or Studio members can vote, and only on shortlisted
-- submissions.
create policy "spotlight_votes: circle+ can vote on shortlisted"
  on public.spotlight_votes for insert
  with check (
    auth.uid() = voter_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid()
        and membership_tier in ('circle', 'studio')
    )
    and exists (
      select 1 from public.spotlight_submissions
      where id = submission_id
        and status = 'shortlisted'
    )
  );

-- Anyone signed in can read vote counts (aggregate via a view below);
-- raw vote rows are readable by the voter themself.
create policy "spotlight_votes: read own"
  on public.spotlight_votes for select
  using (auth.uid() = voter_id);

-- Public-safe vote tally, so the UI can show counts without exposing
-- who voted for what.
create view public.spotlight_vote_counts as
select submission_id, count(*) as vote_count
from public.spotlight_votes
group by submission_id;

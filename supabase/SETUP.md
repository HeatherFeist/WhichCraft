# Supabase setup for WhichCraft

Project ref: `karjtjgwyehqxdoyqfbp`

This session's sandbox can't reach Supabase's API or database directly (its
outbound network is limited to an allowlist, and raw Postgres connections
aren't supported through it at all) — so the schema below needs to be applied
by you, either by pasting SQL into the dashboard or running the CLI from a
machine with normal internet access. Both are one-time, ~2 minute steps.

## Option A: SQL Editor (recommended, no install needed)

1. Go to your project's dashboard: https://supabase.com/dashboard/project/karjtjgwyehqxdoyqfbp
2. Open **SQL Editor** in the left sidebar → **New query**.
3. Open `supabase/migrations/20260822073113_initial_schema.sql` from this repo, copy its full contents, and paste into the editor.
4. Click **Run**.
5. Check **Table Editor** — you should see `profiles`, `host_applications`, `spotlight_submissions`, and `spotlight_votes`.

## Option B: Supabase CLI (from your own machine)

```bash
npm install -g supabase
supabase login
cd WhichCraft
supabase link --project-ref karjtjgwyehqxdoyqfbp
supabase db push
```

## What this migration sets up

- **`profiles`** — one row per member (auto-created on signup via a trigger), holding their `membership_tier` (`spark` / `circle` / `studio`). This is the source of truth for what a member can do.
- **`host_applications`** — Host a Party applications; open to anyone to submit, reviewed manually.
- **`spotlight_submissions`** — Circle+ member video submissions; enforced at the database level (Row Level Security), so only Circle/Studio members can insert one for themselves.
- **`spotlight_votes`** — one vote per member per submission, enforced by a unique constraint (not just app logic) — this is the piece that specifically needed real accounts, which is why it had to wait for Supabase.
- **`spotlight_vote_counts`** — a public-safe view for showing vote tallies without exposing who voted for what.

All tables have Row Level Security enabled with policies matching the rules we designed: Circle+ gating on submissions/votes, self-only reads on personal data, open submission on host applications.

## After running the migration

### 1. Get your API keys
**Project Settings → API** in the dashboard. You'll need:
- **Project URL** (`https://karjtjgwyehqxdoyqfbp.supabase.co`)
- **anon / public key** — safe to use in the site's frontend JS (RLS policies protect the data, not the key)

Share those two and the site's forms (Host a Party, Spotlight, and eventually membership) can be wired to write directly into these tables instead of/alongside Formspree — plus a real sign-in flow, since Spotlight submission/voting genuinely requires a logged-in member (RLS checks `auth.uid()`).

### 2. Enable auth
**Authentication → Providers** — email/password is enabled by default; email magic links are usually the simplest fit for a membership site (no separate password to manage). Turn on whichever you'd like members to use to sign in.

### 3. Keeping `membership_tier` in sync
Right now `membership_tier` defaults to `'spark'` for every new signup and has to be updated by hand (Table Editor → `profiles` → edit the row) after confirming a Circle payment via Stripe. Automating that — a Stripe webhook that updates `membership_tier` when a subscription starts/changes — is a good next step once member accounts are live, so upgrades take effect without manual work.

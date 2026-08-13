# Booking Scheduler App

A Calendly-style booking app. Hosts set weekly availability; guests pick an
open slot on a public page and book it; double-booking is prevented at the
database level; hosts get a dashboard to view/cancel bookings.

Stack: Next.js (App Router) + Supabase (Postgres + Auth).

## Status

Currently built: data model + host auth (signup/login/logout, email
confirmation, protected `/dashboard`). Availability management and the public
booking flow are next.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project, then copy `.env.example` to `.env.local` and
   fill in the values from **Project Settings → API**:

   ```bash
   cp .env.example .env.local
   ```

3. Apply the database schema: open the Supabase SQL Editor and run the
   contents of `supabase/migrations/0001_init.sql` (or use the Supabase CLI
   once the project is linked).

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Data model

- `profiles` — one row per host (1:1 with `auth.users`), holds the public
  booking slug, timezone, and slot length. Auto-created on signup via a
  trigger.
- `availability_rules` — weekly recurring open hours per host
  (`day_of_week` + `start_time`/`end_time`).
- `bookings` — guest bookings. A Postgres `EXCLUDE` constraint
  (`btree_gist`) guarantees no two confirmed bookings for the same host can
  have overlapping time ranges, even under concurrent requests. Guests create
  bookings through the `create_booking()` RPC rather than inserting directly.

Row Level Security is enabled on every table; see
`supabase/migrations/0001_init.sql` for the exact policies.

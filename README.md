# Booking Scheduler App

A Calendly-style booking app. Hosts set weekly availability; guests pick an
open slot on a public page and book it; double-booking is prevented at the
database level; hosts get a dashboard to view/cancel bookings.

Stack: Next.js (App Router) + Supabase (Postgres + Auth).

## Status

Feature-complete for v1:

- Host auth — signup/login/logout, email confirmation, protected `/dashboard`
- `/dashboard/availability` — weekly recurring hours + timezone/slot-length/
  buffer settings
- `/book/[slug]` — public booking page: real open slots (host rules minus
  existing bookings), timezone-aware, booking form with race-condition
  handling
- `/dashboard/bookings` — upcoming/past/cancelled bookings, cancel action

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

3. Apply the database schema: open the Supabase SQL Editor and run, in
   order, everything under `supabase/migrations/` (or use the Supabase CLI
   once the project is linked).

4. Run the dev server:

   ```bash
   npm run dev
   ```

## Data model

- `profiles` — one row per host (1:1 with `auth.users`), holds the public
  booking slug, timezone, slot length, and buffer. Auto-created on signup
  via a trigger.
- `availability_rules` — weekly recurring open hours per host
  (`day_of_week` + `start_time`/`end_time`).
- `bookings` — guest bookings. A Postgres `EXCLUDE` constraint
  (`btree_gist`) guarantees no two confirmed bookings for the same host can
  have overlapping time ranges, even under concurrent requests. Guests create
  bookings through the `create_booking()` RPC rather than inserting directly.
- `busy_slots` — a narrow public view over `bookings` (just `host_id` +
  time range for confirmed bookings) so the public booking page can compute
  open slots without ever exposing guest names/emails.

Row Level Security is enabled on every table; see `supabase/migrations/`
for the exact policies. Available slot math (weekly rules minus busy ranges,
timezone conversion via `date-fns-tz`) lives in `src/lib/availability.ts`.

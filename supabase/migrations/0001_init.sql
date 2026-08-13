-- Booking Scheduler App: initial schema
-- profiles (hosts) + availability_rules + bookings, with RLS and an
-- exclusion constraint that makes double-booking impossible at the DB level.

create extension if not exists "btree_gist";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per host, 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  slug text not null unique,
  full_name text not null default '',
  timezone text not null default 'UTC',
  slot_duration_minutes int not null default 30 check (slot_duration_minutes > 0),
  buffer_minutes int not null default 0 check (buffer_minutes >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Public booking pages need to look hosts up by slug.
create policy "Profiles are publicly readable"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Hosts can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Hosts can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a starter profile whenever someone signs up, so every
-- authenticated user has a bookable slug immediately (editable later).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  candidate_slug text;
  suffix int := 0;
begin
  base_slug := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := coalesce(nullif(base_slug, ''), 'host');
  candidate_slug := base_slug;

  while exists (select 1 from public.profiles where slug = candidate_slug) loop
    suffix := suffix + 1;
    candidate_slug := base_slug || '-' || suffix;
  end loop;

  insert into public.profiles (id, slug, full_name)
  values (new.id, candidate_slug, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- availability_rules: weekly recurring open hours per host
-- ---------------------------------------------------------------------------
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index availability_rules_host_id_idx on public.availability_rules (host_id);

alter table public.availability_rules enable row level security;

create policy "Availability rules are publicly readable"
  on public.availability_rules for select
  to anon, authenticated
  using (true);

create policy "Hosts manage their own availability rules"
  on public.availability_rules for all
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (end_time > start_time),
  -- The actual double-booking guard: no two *confirmed* bookings for the
  -- same host may have overlapping time ranges. Enforced by Postgres
  -- itself, so it holds even under concurrent requests.
  exclude using gist (
    host_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status = 'confirmed')
);

create index bookings_host_id_idx on public.bookings (host_id);

alter table public.bookings enable row level security;

-- No public select policy: guests never read the bookings table directly,
-- they only get a confirmation from the create_booking() RPC below. Hosts
-- can only see their own bookings.
create policy "Hosts can view their own bookings"
  on public.bookings for select
  to authenticated
  using (auth.uid() = host_id);

create policy "Hosts can cancel their own bookings"
  on public.bookings for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- Guests book through this security-definer function instead of inserting
-- into the table directly. That keeps the table locked down while still
-- letting anonymous visitors create a booking; the exclusion constraint
-- above is what actually prevents a race-condition double-booking.
create function public.create_booking(
  p_host_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_guest_name text,
  p_guest_email text
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
begin
  if p_end_time <= p_start_time then
    raise exception 'end_time must be after start_time';
  end if;

  insert into public.bookings (host_id, start_time, end_time, guest_name, guest_email)
  values (p_host_id, p_start_time, p_end_time, trim(p_guest_name), lower(trim(p_guest_email)))
  returning * into v_booking;

  return v_booking;
end;
$$;

grant execute on function public.create_booking(uuid, timestamptz, timestamptz, text, text) to anon, authenticated;

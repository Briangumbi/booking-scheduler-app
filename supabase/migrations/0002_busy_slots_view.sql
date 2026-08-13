-- Public booking pages need to know which times are already taken so they
-- don't offer a slot that's booked, but guests should never see who booked
-- it. bookings itself has no public select policy, so expose a narrow view
-- instead: just host_id + the time range, for confirmed bookings only.
--
-- Views execute with the privileges of their owner (not the querying role)
-- for permission checks, so this view can read the locked-down bookings
-- table even though anon/authenticated can't select from it directly.
create view public.busy_slots as
select host_id, start_time, end_time
from public.bookings
where status = 'confirmed';

grant select on public.busy_slots to anon, authenticated;

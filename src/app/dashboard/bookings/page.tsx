import { createClient } from "@/lib/supabase/server";
import { cancelBooking } from "./actions";

function formatRange(start: string, end: string, timezone: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const datePart = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(startDate);
  const timeFmt = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  });
  return `${datePart}, ${timeFmt.format(startDate)} – ${timeFmt.format(endDate)}`;
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user!.id)
    .single();

  const timezone = profile?.timezone ?? "UTC";
  const nowIso = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("host_id", user!.id)
      .eq("status", "confirmed")
      .gte("start_time", nowIso)
      .order("start_time"),
    supabase
      .from("bookings")
      .select("*")
      .eq("host_id", user!.id)
      .or(`status.eq.cancelled,start_time.lt.${nowIso}`)
      .order("start_time", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="flex max-w-[640px] flex-col gap-8">
      <h1 className="text-[26px] font-bold tracking-[-0.02em]">Bookings</h1>

      <section className="flex flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold">Upcoming</h2>
        {!upcoming || upcoming.length === 0 ? (
          <p className="text-sm text-foreground-muted">No upcoming bookings.</p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {upcoming.map((booking, i) => (
              <li
                key={booking.id}
                className={`flex items-center justify-between gap-3 px-5 py-4 ${
                  i < upcoming.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm font-semibold">
                    {formatRange(booking.start_time, booking.end_time, timezone)}
                  </p>
                  <p className="truncate text-[13px] text-foreground-muted">
                    {booking.guest_name} · {booking.guest_email}
                  </p>
                </div>
                <form action={cancelBooking.bind(null, booking.id)}>
                  <button
                    type="submit"
                    className="shrink-0 rounded-lg border border-border bg-input px-3.5 py-1.5 text-xs font-semibold text-danger"
                  >
                    Cancel
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold">Past &amp; cancelled</h2>
        {!past || past.length === 0 ? (
          <p className="text-sm text-foreground-muted">Nothing here yet.</p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            {past.map((booking, i) => (
              <li
                key={booking.id}
                className={`flex items-center justify-between gap-3 px-5 py-4 ${
                  i < past.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-sm font-semibold">
                    {formatRange(booking.start_time, booking.end_time, timezone)}
                  </p>
                  <p className="truncate text-[13px] text-foreground-muted">
                    {booking.guest_name} · {booking.guest_email}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    booking.status === "cancelled"
                      ? "bg-danger-bg text-danger"
                      : "bg-muted text-foreground-muted"
                  }`}
                >
                  {booking.status === "cancelled" ? "Cancelled" : "Past"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

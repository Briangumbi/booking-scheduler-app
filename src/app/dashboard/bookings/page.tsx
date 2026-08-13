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
    <>
      <h1 className="text-2xl font-semibold">Bookings</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Upcoming</h2>
        {!upcoming || upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming bookings.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {upcoming.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {formatRange(booking.start_time, booking.end_time, timezone)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} · {booking.guest_email}
                  </p>
                </div>
                <form action={cancelBooking.bind(null, booking.id)}>
                  <button type="submit" className="text-sm text-red-600 underline">
                    Cancel
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Past &amp; cancelled</h2>
        {!past || past.length === 0 ? (
          <p className="text-sm text-gray-500">Nothing here yet.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {past.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">
                    {formatRange(booking.start_time, booking.end_time, timezone)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.guest_name} · {booking.guest_email}
                  </p>
                </div>
                <span
                  className={`text-xs ${
                    booking.status === "cancelled" ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  {booking.status === "cancelled" ? "Cancelled" : "Past"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

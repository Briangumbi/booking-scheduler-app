import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeAvailableSlots } from "@/lib/availability";
import { BookingCalendar } from "./booking-calendar";

const DAYS_AHEAD = 14;

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profile) {
    notFound();
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + (DAYS_AHEAD + 1) * 24 * 60 * 60 * 1000);

  const [{ data: rules }, { data: busy }] = await Promise.all([
    supabase.from("availability_rules").select("*").eq("host_id", profile.id),
    supabase
      .from("busy_slots")
      .select("*")
      .eq("host_id", profile.id)
      .lte("start_time", windowEnd.toISOString()),
  ]);

  const slotsByDate = computeAvailableSlots({
    rules: rules ?? [],
    busy: (busy ?? []).map((b) => ({ start: b.start_time, end: b.end_time })),
    timezone: profile.timezone,
    slotDurationMinutes: profile.slot_duration_minutes,
    bufferMinutes: profile.buffer_minutes,
    daysAhead: DAYS_AHEAD,
    now,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold">
          Book time with {profile.full_name || profile.slug}
        </h1>
        <p className="text-sm text-gray-500">Pick an open slot below.</p>
      </div>

      <BookingCalendar
        hostId={profile.id}
        hostName={profile.full_name || profile.slug}
        slotsByDate={slotsByDate}
      />
    </main>
  );
}

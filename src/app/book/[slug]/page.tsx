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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-1 flex-col gap-7 px-6 py-14">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">
          Book time with {profile.full_name || profile.slug}
        </h1>
        <p className="text-sm text-foreground-muted">Pick an open slot below.</p>
      </div>

      <BookingCalendar
        hostId={profile.id}
        hostName={profile.full_name || profile.slug}
        slotsByDate={slotsByDate}
      />
    </main>
  );
}

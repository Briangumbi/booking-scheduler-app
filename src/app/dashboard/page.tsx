import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CopyLinkButton } from "./copy-link-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const [{ count: upcomingCount }, { data: rules }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("host_id", user!.id)
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString()),
    supabase.from("availability_rules").select("day_of_week").eq("host_id", user!.id),
  ]);

  const openDays = new Set((rules ?? []).map((r) => r.day_of_week)).size;
  const bookingUrl = profile
    ? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/book/${profile.slug}`
    : "";

  return (
    <div className="flex max-w-[640px] flex-col gap-7">
      <div>
        <h1 className="mb-1.5 text-[26px] font-bold tracking-[-0.02em]">Overview</h1>
        <p className="text-sm text-foreground-muted">Signed in as {user!.email}</p>
      </div>

      {profile && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-[0.04em] text-foreground-muted uppercase">
              Your booking page
            </span>
            <Link
              href={`/book/${profile.slug}`}
              className="truncate text-sm font-medium text-foreground no-underline"
            >
              {bookingUrl.replace(/^https?:\/\//, "")}
            </Link>
          </div>
          <CopyLinkButton url={bookingUrl} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3.5">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4.5 shadow-card">
          <span className="text-2xl font-bold tracking-[-0.02em]">{upcomingCount ?? 0}</span>
          <span className="text-[13px] text-foreground-muted">Upcoming bookings</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4.5 shadow-card">
          <span className="text-2xl font-bold tracking-[-0.02em]">{openDays}</span>
          <span className="text-[13px] text-foreground-muted">Open days / week</span>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4.5 shadow-card">
          <span className="text-2xl font-bold tracking-[-0.02em]">
            {profile?.slot_duration_minutes ?? 30}m
          </span>
          <span className="text-[13px] text-foreground-muted">Slot length</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/availability"
          className="w-fit rounded-lg bg-primary px-4.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card no-underline"
        >
          Set your availability
        </Link>
        <Link
          href="/dashboard/bookings"
          className="w-fit rounded-lg border border-border bg-input px-4.5 py-2.5 text-sm font-semibold text-foreground no-underline"
        >
          View bookings
        </Link>
      </div>
    </div>
  );
}

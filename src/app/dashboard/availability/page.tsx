import { createClient } from "@/lib/supabase/server";
import { deleteAvailabilityRule } from "./actions";
import { RuleForm } from "./rule-form";
import { SettingsForm } from "./settings-form";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(time: string) {
  // time comes back from Postgres as "HH:MM:SS"
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default async function AvailabilityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: rules }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("availability_rules")
      .select("*")
      .eq("host_id", user!.id)
      .order("day_of_week")
      .order("start_time"),
  ]);

  const rulesByDay = DAYS.map((_, dayOfWeek) =>
    (rules ?? []).filter((rule) => rule.day_of_week === dayOfWeek),
  );

  return (
    <div className="flex max-w-[720px] flex-col gap-8">
      <h1 className="text-[26px] font-bold tracking-[-0.02em]">Availability</h1>

      <section className="flex flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold">Settings</h2>
        {profile && (
          <SettingsForm
            timezone={profile.timezone}
            slotDurationMinutes={profile.slot_duration_minutes}
            bufferMinutes={profile.buffer_minutes}
          />
        )}
      </section>

      <section className="flex flex-col gap-3.5">
        <h2 className="text-[15px] font-semibold">Weekly hours</h2>
        <RuleForm />

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
          {DAYS.map((day, dayOfWeek) => (
            <div
              key={day}
              className={`flex flex-wrap items-center gap-3 px-5 py-3.5 ${
                dayOfWeek < 6 ? "border-b border-border" : ""
              }`}
            >
              <span className="w-[100px] shrink-0 text-sm font-semibold">{day}</span>

              {rulesByDay[dayOfWeek].length === 0 ? (
                <span className="text-[13px] text-subtle">Unavailable</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rulesByDay[dayOfWeek].map((rule) => (
                    <form
                      key={rule.id}
                      action={deleteAvailabilityRule.bind(null, rule.id)}
                      className="flex items-center gap-2 rounded-full bg-muted py-1.5 pr-1.5 pl-3.5 text-[13px] font-medium"
                    >
                      <span>
                        {formatTime(rule.start_time)} – {formatTime(rule.end_time)}
                      </span>
                      <button
                        type="submit"
                        aria-label="Remove"
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[13px] leading-none text-foreground-muted"
                      >
                        ×
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

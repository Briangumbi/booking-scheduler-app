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
    <>
      <h1 className="text-2xl font-semibold">Availability</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Settings</h2>
        {profile && (
          <SettingsForm
            timezone={profile.timezone}
            slotDurationMinutes={profile.slot_duration_minutes}
            bufferMinutes={profile.buffer_minutes}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Weekly hours</h2>
        <RuleForm />

        <div className="flex flex-col divide-y">
          {DAYS.map((day, dayOfWeek) => (
            <div key={day} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-24 shrink-0 text-sm font-medium">{day}</span>

              {rulesByDay[dayOfWeek].length === 0 ? (
                <span className="text-sm text-gray-400">Unavailable</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {rulesByDay[dayOfWeek].map((rule) => (
                    <form
                      key={rule.id}
                      action={deleteAvailabilityRule.bind(null, rule.id)}
                      className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1 text-sm"
                    >
                      <span>
                        {formatTime(rule.start_time)} – {formatTime(rule.end_time)}
                      </span>
                      <button type="submit" className="text-gray-500 hover:text-red-600" aria-label="Remove">
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
    </>
  );
}

import { fromZonedTime, toZonedTime } from "date-fns-tz";

export type AvailabilityRule = {
  day_of_week: number;
  start_time: string; // "HH:MM:SS"
  end_time: string; // "HH:MM:SS"
};

export type BusyRange = {
  start: string; // ISO
  end: string; // ISO
};

export type Slot = {
  start: string; // ISO
  end: string; // ISO
};

function parseTimeOfDay(time: string) {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

/**
 * Computes open, bookable slots for a host over a range of calendar days
 * (in the host's own timezone), grouped by local date ("YYYY-MM-DD").
 *
 * Rules describe a fixed weekly schedule; a rule never spans past midnight
 * (enforced end_time > start_time), so each day is handled independently.
 */
export function computeAvailableSlots({
  rules,
  busy,
  timezone,
  slotDurationMinutes,
  bufferMinutes,
  daysAhead,
  now = new Date(),
}: {
  rules: AvailabilityRule[];
  busy: BusyRange[];
  timezone: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
  daysAhead: number;
  now?: Date;
}): Record<string, Slot[]> {
  const slotMs = slotDurationMinutes * 60_000;
  const bufferMs = bufferMinutes * 60_000;

  const busyMs = busy.map((b) => ({
    start: new Date(b.start).getTime() - bufferMs,
    end: new Date(b.end).getTime() + bufferMs,
  }));

  const nowZoned = toZonedTime(now, timezone);
  const startYear = nowZoned.getUTCFullYear();
  const startMonth = nowZoned.getUTCMonth();
  const startDate = nowZoned.getUTCDate();

  const result: Record<string, Slot[]> = {};

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const localDay = new Date(Date.UTC(startYear, startMonth, startDate + dayOffset));
    const dayOfWeek = localDay.getUTCDay();
    const dateKey = localDay.toISOString().slice(0, 10);

    const rulesForDay = rules.filter((r) => r.day_of_week === dayOfWeek);
    const daySlots: Slot[] = [];

    for (const rule of rulesForDay) {
      const startOfDay = parseTimeOfDay(rule.start_time);
      const endOfDay = parseTimeOfDay(rule.end_time);

      const windowStart = fromZonedTime(
        new Date(
          Date.UTC(
            localDay.getUTCFullYear(),
            localDay.getUTCMonth(),
            localDay.getUTCDate(),
            startOfDay.hours,
            startOfDay.minutes,
          ),
        ),
        timezone,
      ).getTime();
      const windowEnd = fromZonedTime(
        new Date(
          Date.UTC(
            localDay.getUTCFullYear(),
            localDay.getUTCMonth(),
            localDay.getUTCDate(),
            endOfDay.hours,
            endOfDay.minutes,
          ),
        ),
        timezone,
      ).getTime();

      for (let slotStart = windowStart; slotStart + slotMs <= windowEnd; slotStart += slotMs) {
        const slotEnd = slotStart + slotMs;

        if (slotStart <= now.getTime()) continue;

        const overlapsBusy = busyMs.some((b) => slotStart < b.end && slotEnd > b.start);
        if (overlapsBusy) continue;

        daySlots.push({
          start: new Date(slotStart).toISOString(),
          end: new Date(slotEnd).toISOString(),
        });
      }
    }

    daySlots.sort((a, b) => a.start.localeCompare(b.start));
    if (daySlots.length > 0) {
      result[dateKey] = daySlots;
    }
  }

  return result;
}

"use client";

import { useActionState } from "react";
import { addAvailabilityRule } from "./actions";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function RuleForm() {
  const [state, formAction, pending] = useActionState(addAvailabilityRule, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Day
        <select name="dayOfWeek" defaultValue="1" className="rounded border px-3 py-2">
          {DAYS.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Start
        <input type="time" name="startTime" required defaultValue="09:00" className="rounded border px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        End
        <input type="time" name="endTime" required defaultValue="17:00" className="rounded border px-3 py-2" />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add hours"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

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
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3.5 rounded-xl border border-border bg-card p-4.5 shadow-card"
    >
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Day
        <select
          name="dayOfWeek"
          defaultValue="1"
          className="rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        >
          {DAYS.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Start
        <input
          type="time"
          name="startTime"
          required
          defaultValue="09:00"
          className="rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        End
        <input
          type="time"
          name="endTime"
          required
          defaultValue="17:00"
          className="rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add hours"}
      </button>

      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}

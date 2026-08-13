"use client";

import { useActionState } from "react";
import { updateProfileSettings } from "./actions";

export function SettingsForm({
  timezone,
  slotDurationMinutes,
  bufferMinutes,
}: {
  timezone: string;
  slotDurationMinutes: number;
  bufferMinutes: number;
}) {
  const [state, formAction, pending] = useActionState(updateProfileSettings, null);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5 shadow-card"
    >
      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Timezone (IANA)
        <input
          type="text"
          name="timezone"
          required
          defaultValue={timezone}
          placeholder="America/New_York"
          className="w-[180px] rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Slot length (minutes)
        <input
          type="number"
          name="slotDurationMinutes"
          required
          min={5}
          step={5}
          defaultValue={slotDurationMinutes}
          className="w-[100px] rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
        Buffer between bookings (minutes)
        <input
          type="number"
          name="bufferMinutes"
          required
          min={0}
          step={5}
          defaultValue={bufferMinutes}
          className="w-[100px] rounded-lg border border-border bg-input px-2.5 py-2 text-sm text-foreground"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>

      {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
    </form>
  );
}

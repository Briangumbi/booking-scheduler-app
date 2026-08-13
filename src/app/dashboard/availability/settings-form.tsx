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
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Timezone (IANA)
        <input
          type="text"
          name="timezone"
          required
          defaultValue={timezone}
          placeholder="America/New_York"
          className="w-48 rounded border px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slot length (minutes)
        <input
          type="number"
          name="slotDurationMinutes"
          required
          min={5}
          step={5}
          defaultValue={slotDurationMinutes}
          className="w-32 rounded border px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Buffer between bookings (minutes)
        <input
          type="number"
          name="bufferMinutes"
          required
          min={0}
          step={5}
          defaultValue={bufferMinutes}
          className="w-32 rounded border px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>

      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

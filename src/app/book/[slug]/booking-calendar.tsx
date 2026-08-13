"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { bookSlot, type BookingResult } from "./actions";
import type { Slot } from "@/lib/availability";

function formatDateLabel(dateKey: string) {
  // dateKey is "YYYY-MM-DD" anchored at UTC midnight for the host's local day.
  const d = new Date(`${dateKey}T00:00:00Z`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function formatSlotTime(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function BookingCalendar({
  hostId,
  hostName,
  slotsByDate,
}: {
  hostId: string;
  hostName: string;
  slotsByDate: Record<string, Slot[]>;
}) {
  const dateKeys = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const [selectedDate, setSelectedDate] = useState(dateKeys[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const initialState: BookingResult = { status: "idle" };
  const [state, formAction, pending] = useActionState(bookSlot, initialState);

  if (dateKeys.length === 0) {
    return <p className="text-sm text-gray-500">No open times in the next couple of weeks.</p>;
  }

  if (state.status === "booked") {
    return (
      <div className="rounded border border-green-200 bg-green-50 p-6 text-sm">
        <p className="font-medium text-green-800">You&apos;re booked with {hostName}.</p>
        <p className="mt-1 text-green-700">
          {new Intl.DateTimeFormat(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(state.start))}{" "}
          – {formatSlotTime(state.end)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">Times shown in your local timezone.</p>

      <div className="flex flex-wrap gap-2">
        {dateKeys.map((dateKey) => (
          <button
            key={dateKey}
            type="button"
            onClick={() => {
              setSelectedDate(dateKey);
              setSelectedSlot(null);
            }}
            className={`rounded border px-3 py-2 text-sm ${
              dateKey === selectedDate ? "border-black bg-black text-white" : "border-gray-200"
            }`}
          >
            {formatDateLabel(dateKey)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(slotsByDate[selectedDate] ?? []).map((slot) => (
          <button
            key={slot.start}
            type="button"
            onClick={() => setSelectedSlot(slot)}
            className={`rounded border px-3 py-2 text-sm ${
              selectedSlot?.start === slot.start
                ? "border-black bg-black text-white"
                : "border-gray-200"
            }`}
          >
            {formatSlotTime(slot.start)}
          </button>
        ))}
      </div>

      {selectedSlot && (
        <form action={formAction} className="flex flex-col gap-3 rounded border p-4">
          <p className="text-sm font-medium">
            {formatDateLabel(selectedDate)} at {formatSlotTime(selectedSlot.start)}
          </p>

          <input type="hidden" name="hostId" value={hostId} />
          <input type="hidden" name="start" value={selectedSlot.start} />
          <input type="hidden" name="end" value={selectedSlot.end} />

          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input type="text" name="guestName" required className="rounded border px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Your email
            <input type="email" name="guestEmail" required className="rounded border px-3 py-2" />
          </label>

          {state.status === "error" && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      )}
    </div>
  );
}

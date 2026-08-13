"use server";

import { createClient } from "@/lib/supabase/server";

export type BookingResult =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "booked"; start: string; end: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function bookSlot(
  _prevState: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const hostId = String(formData.get("hostId") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim();

  if (!hostId || !start || !end) {
    return { status: "error", error: "Missing slot details, please pick a time again." };
  }
  if (!guestName) {
    return { status: "error", error: "Please enter your name." };
  }
  if (!EMAIL_RE.test(guestEmail)) {
    return { status: "error", error: "Please enter a valid email." };
  }
  if (new Date(start).getTime() <= Date.now()) {
    return { status: "error", error: "That slot is no longer in the future, please pick another." };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("create_booking", {
    p_host_id: hostId,
    p_start_time: start,
    p_end_time: end,
    p_guest_name: guestName,
    p_guest_email: guestEmail,
  });

  if (error) {
    if (error.code === "23P01") {
      return {
        status: "error",
        error: "Sorry, that slot was just booked by someone else. Please pick another time.",
      };
    }
    return { status: "error", error: "Could not create the booking, please try again." };
  }

  return { status: "booked", start, end };
}

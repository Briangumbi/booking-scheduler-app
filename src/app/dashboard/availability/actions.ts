"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string } | null;

async function requireHostId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return { supabase, hostId: user.id };
}

export async function addAvailabilityRule(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { error: "Pick a valid day." };
  }
  if (!startTime || !endTime) {
    return { error: "Start and end time are required." };
  }
  if (startTime >= endTime) {
    return { error: "End time must be after start time." };
  }

  const { supabase, hostId } = await requireHostId();

  const { error } = await supabase.from("availability_rules").insert({
    host_id: hostId,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/availability");
  return null;
}

export async function deleteAvailabilityRule(id: string) {
  const { supabase, hostId } = await requireHostId();

  await supabase.from("availability_rules").delete().eq("id", id).eq("host_id", hostId);

  revalidatePath("/dashboard/availability");
}

export async function updateProfileSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const timezone = String(formData.get("timezone") ?? "").trim();
  const slotDurationMinutes = Number(formData.get("slotDurationMinutes"));
  const bufferMinutes = Number(formData.get("bufferMinutes"));

  if (!timezone) {
    return { error: "Timezone is required." };
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    return { error: "That doesn't look like a valid IANA timezone (e.g. America/New_York)." };
  }
  if (!Number.isInteger(slotDurationMinutes) || slotDurationMinutes <= 0) {
    return { error: "Slot length must be a positive number of minutes." };
  }
  if (!Number.isInteger(bufferMinutes) || bufferMinutes < 0) {
    return { error: "Buffer must be zero or a positive number of minutes." };
  }

  const { supabase, hostId } = await requireHostId();

  const { error } = await supabase
    .from("profiles")
    .update({
      timezone,
      slot_duration_minutes: slotDurationMinutes,
      buffer_minutes: bufferMinutes,
    })
    .eq("id", hostId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/availability");
  revalidatePath("/dashboard");
  return null;
}

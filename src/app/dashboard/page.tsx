import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <>
      <h1 className="text-2xl font-semibold">Overview</h1>

      <p className="text-sm text-gray-600">Signed in as {user!.email}</p>

      {profile && (
        <p className="text-sm text-gray-600">
          Your public booking page:{" "}
          <Link href={`/book/${profile.slug}`} className="underline">
            /book/{profile.slug}
          </Link>
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard/availability"
          className="w-fit rounded bg-black px-4 py-2 text-sm text-white"
        >
          Set your availability
        </Link>
        <Link
          href="/dashboard/bookings"
          className="w-fit rounded border px-4 py-2 text-sm"
        >
          View bookings
        </Link>
      </div>
    </>
  );
}

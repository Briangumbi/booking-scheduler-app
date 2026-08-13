import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Log out
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-600">Signed in as {user.email}</p>

      {profile && (
        <p className="text-sm text-gray-600">
          Your public booking page will be at{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">/book/{profile.slug}</code>
        </p>
      )}

      <div className="rounded border border-dashed p-6 text-sm text-gray-500">
        Availability settings and booking list are coming up next.
      </div>
    </main>
  );
}

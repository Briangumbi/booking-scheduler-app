import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="font-semibold">
            Dashboard
          </Link>
          <Link href="/dashboard/availability" className="text-gray-600 hover:text-black">
            Availability
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Log out
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}

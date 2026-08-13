import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { SidebarNav } from "./sidebar-nav";

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name || user.email!.split("@")[0];
  const initials = initialsFrom(profile?.full_name ?? "", user.email!);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1240px]">
      <aside className="flex min-h-screen w-[220px] shrink-0 flex-col gap-7 border-r border-border px-4 py-7">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-[26px] w-[26px] shrink-0 rounded-[7px] bg-primary" />
          <span className="text-[15px] font-bold tracking-[-0.01em]">Scheduler</span>
        </div>

        <SidebarNav />

        <div className="mt-auto flex flex-col gap-2.5 border-t border-border px-2 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-soft-foreground">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold">{displayName}</span>
              <span className="truncate text-[11px] text-foreground-muted">{user.email}</span>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="py-1 text-left text-[13px] text-foreground-muted"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-10 pt-10 pb-16">{children}</div>
    </div>
  );
}

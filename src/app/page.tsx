import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[380px] flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="h-9 w-9 rounded-[10px] bg-primary" />
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">Booking Scheduler</h1>
        <p className="text-sm text-foreground-muted">
          Set your availability and let people book time with you.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="rounded-lg bg-primary px-4.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card no-underline"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-border bg-input px-4.5 py-2.5 text-sm font-semibold text-foreground no-underline"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}

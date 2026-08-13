import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold">Booking Scheduler</h1>
      <p className="text-sm text-gray-600">
        Set your availability and let people book time with you.
      </p>
      <div className="flex gap-4">
        <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
          Sign up
        </Link>
        <Link href="/login" className="rounded border px-4 py-2">
          Log in
        </Link>
      </div>
    </main>
  );
}

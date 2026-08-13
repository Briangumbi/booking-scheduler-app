"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/app/auth/actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, null);

  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-[380px] flex-1 flex-col justify-center gap-7 px-6">
      <div className="flex flex-col gap-1.5">
        <div className="mb-2 h-9 w-9 rounded-[10px] bg-primary" />
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">Create your host account</h1>
        <p className="text-sm text-foreground-muted">Set your availability and start taking bookings.</p>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-login"
      >
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
          Full name
          <input
            type="text"
            name="fullName"
            required
            autoComplete="name"
            className="rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-label">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className="rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground"
          />
        </label>

        {state?.error && <p className="text-sm text-danger">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-lg bg-primary py-[11px] text-sm font-semibold text-primary-foreground shadow-card disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-[13px] text-foreground-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary no-underline">
          Log in
        </Link>
      </p>
    </main>
  );
}

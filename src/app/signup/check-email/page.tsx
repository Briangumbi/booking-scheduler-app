export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-[380px] flex-1 flex-col justify-center gap-3 px-6 text-center">
      <div className="mx-auto mb-2 h-9 w-9 rounded-[10px] bg-primary" />
      <h1 className="text-[26px] font-bold tracking-[-0.02em]">Check your email</h1>
      <p className="text-sm text-foreground-muted">
        We sent you a confirmation link. Click it to activate your account and
        get to your dashboard.
      </p>
    </main>
  );
}

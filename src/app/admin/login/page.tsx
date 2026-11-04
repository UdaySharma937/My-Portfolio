"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { login, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={action} className="glass w-full max-w-md space-y-5 rounded-[2rem] p-8 sm:p-10">
        <div className="text-center">
          <div className="planet-static mx-auto mb-4 h-16 w-16" aria-hidden />
          <h1 className="text-3xl font-extrabold"><span className="text-gradient">Mission Control</span></h1>
          <p className="mt-1 text-sm text-muted">Admin sign in</p>
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required className="field" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
        </div>
        {state.error && <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">{state.error}</p>}
        <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

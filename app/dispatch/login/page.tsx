"use client";

import { useActionState } from "react";
import { loginToDispatch } from "@/app/actions/dispatch";

export default function DispatchLoginPage() {
  const [state, action, pending] = useActionState(loginToDispatch, undefined);

  return (
    <div className="min-h-screen bg-[#0a0e14] text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 mb-4 text-center">
          Apex Plumbing & Heating
        </p>
        <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.03]">
          <h1 className="text-2xl font-semibold mb-6">Dispatch sign-in</h1>
          <form action={action} className="flex flex-col gap-4">
            <input
              type="password"
              name="password"
              placeholder="Dispatch password"
              className="bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
            />
            {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="bg-cyan-400 text-zinc-950 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

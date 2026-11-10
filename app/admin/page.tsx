"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("The access code is invalid or the admin session is unavailable.");
      }

      router.push("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3eb] px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-[#e5e0d8] bg-white p-8 shadow-[0_25px_80px_rgba(36,53,45,0.06)]">
        <p className="eyebrow eyebrow-small"><span className="eyebrow-dot" /> Secure access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Admin review</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d6760]">
          Sign in with the administrator code configured for this deployment.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <label htmlFor="admin-code" className="form-label">Access code</label>
          <input
            id="admin-code"
            className="form-input mt-2"
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter code"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={busy} className="button-primary mt-5 w-full justify-center disabled:opacity-60">
            {busy ? "Signing in…" : "Open dashboard"}
          </button>

          {error ? <p role="alert" className="mt-3 text-sm text-[#b65757]">{error}</p> : null}
        </form>

        <a href="/" className="mt-6 inline-block text-sm font-medium text-[#526c5b]">← Back to home</a>
      </div>
    </main>
  );
}

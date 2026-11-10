"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_CODE = "rosecare";

export default function AdminPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.trim().toLowerCase() === ADMIN_CODE) {
      window.localStorage.setItem("rose-foundation-admin", "true");
      router.push("/dashboard");
      return;
    }
    setError("That access code is not correct.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3eb] px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-[#e5e0d8] bg-white p-8 shadow-[0_25px_80px_rgba(36,53,45,0.06)]">
        <p className="eyebrow eyebrow-small"><span className="eyebrow-dot"/> Secure access</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Admin review</h1>
        <p className="mt-3 text-sm leading-6 text-[#5d6760]">Use the access code to review community submissions and keep the kindness flow moving.</p>

        <form onSubmit={onSubmit} className="mt-7">
          <label htmlFor="admin-code" className="form-label">Access code</label>
          <input
            id="admin-code"
            className="form-input mt-2"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            type="password"
            placeholder="Enter code"
            autoComplete="off"
            required
          />
          <button type="submit" className="button-primary mt-5 w-full justify-center">Open dashboard</button>
          {error ? <p className="mt-3 text-sm text-[#b65757]">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}

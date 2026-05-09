"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = (await response.json()) as { error?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error || "Login failed.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="mt-5 space-y-4" onSubmit={login}>
      <div>
        <label className="editor-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-black bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border border-black bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      {error && (
        <p className="border border-black bg-accent-soft p-3 text-sm font-bold">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="block w-full border-2 border-black bg-black px-3 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Checking..." : "Login"}
      </button>
    </form>
  );
}

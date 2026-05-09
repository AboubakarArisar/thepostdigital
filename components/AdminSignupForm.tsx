"use client";

import { FormEvent, useState } from "react";

export function AdminSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = (await response.json()) as { error?: string; message?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(result.error || "Signup failed.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setMessage(result.message || "Signup received for super admin approval.");
  }

  return (
    <form className="mt-5 space-y-4 border-t-2 border-black pt-5" onSubmit={signup}>
      <p className="text-xs font-black uppercase tracking-[0.16em]">
        Request admin access
      </p>
      <div>
        <label className="editor-label" htmlFor="signup-name">
          Name
        </label>
        <input
          id="signup-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-black bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-black bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
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
      {message && (
        <p className="border border-black bg-white p-3 text-sm font-bold">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="block w-full border-2 border-black px-3 py-3 text-center text-sm font-black uppercase tracking-[0.14em] hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Create pending account"}
      </button>
    </form>
  );
}

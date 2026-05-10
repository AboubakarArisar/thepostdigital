"use client";

import { FormEvent, useState } from "react";

const passwordRules = [
  "Use at least 8 characters.",
  "Choose something unique to this newsroom account.",
  "You can sign in after a super admin approves your request.",
];

export function AdminSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const canSubmit =
    trimmedName.length > 1 && trimmedEmail.includes("@") && password.length >= 8;

  async function signup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      setError("Enter your name, a valid email, and a password with 8+ characters.");
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/admin/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password }),
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
    <form className="space-y-4" onSubmit={signup}>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
          Request admin access
        </p>
        <h2 className="font-serif-display mt-2 text-3xl font-black leading-none">
          Request access
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-700">
          Enter your details and a super admin will review the request.
        </p>
      </div>
      <div>
        <label className="editor-label" htmlFor="signup-name">
          Full name
        </label>
        <input
          id="signup-name"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Ayesha Khan"
          className="w-full border border-black bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@newsroom.com"
          className="w-full border border-black bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-black"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimum 8 characters"
          className="w-full border border-black bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-black"
        />
        <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
          {passwordRules.map((rule) => (
            <li className="flex gap-2" key={rule}>
              <span aria-hidden="true" className="font-black text-accent">
                -
              </span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
      {error && (
        <p className="border border-black bg-accent-soft p-3 text-sm font-bold" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="border border-black bg-white p-3 text-sm font-bold" role="status">
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="block w-full border-2 border-black px-3 py-3 text-center text-sm font-black uppercase tracking-[0.14em] hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Submit request"}
      </button>
    </form>
  );
}

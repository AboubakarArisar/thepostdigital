"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@post.local"
          className="w-full border border-wheat-900 bg-paper px-3 py-3 outline-none focus:ring-2 focus:ring-wheat-900"
        />
      </div>
      <div>
        <label className="editor-label" htmlFor="password">
          Password
        </label>
        <div className="flex border border-wheat-900 bg-paper focus-within:ring-2 focus-within:ring-wheat-900">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"
          />
          <button
            type="button"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
            className="grid w-12 place-items-center border-l border-wheat-900 text-muted hover:bg-black hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {showPassword ? (
                <>
                  <path d="M2 2l20 20" />
                  <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a18 18 0 0 1-2.16 3.19" />
                  <path d="M6.61 6.61A18 18 0 0 0 2 11s3.6 7 10 7a9 9 0 0 0 5.39-1.61" />
                </>
              ) : (
                <>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <p className="border border-wheat-900 bg-accent-soft p-3 text-sm font-bold" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="block w-full border-2 border-wheat-900 bg-black px-3 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Checking..." : "Login"}
      </button>
    </form>
  );
}

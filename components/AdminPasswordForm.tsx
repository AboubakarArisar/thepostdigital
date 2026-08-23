"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(result.error || "Password could not be changed.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed.");
    } catch {
      setError("Password could not be changed. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl border-2 border-wheat-900 p-4">
      <label className="editor-label" htmlFor="current-password">
        Current password
      </label>
      <input
        id="current-password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        className="w-full border border-wheat-900 bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-wheat-900"
      />

      <label className="editor-label mt-4" htmlFor="new-password">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        className="w-full border border-wheat-900 bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-wheat-900"
      />

      <label className="editor-label mt-4" htmlFor="confirm-password">
        Confirm new password
      </label>
      <input
        id="confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        className="w-full border border-wheat-900 bg-paper px-3 py-2 outline-none focus:ring-2 focus:ring-wheat-900"
      />

      {error && (
        <p className="mt-4 border border-wheat-900 bg-accent-soft p-3 text-sm font-bold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="mt-4 border-2 border-wheat-900 bg-black px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
      >
        {isSaving ? "Changing..." : "Change password"}
      </button>
    </form>
  );
}

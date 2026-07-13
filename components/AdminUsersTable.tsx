"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "@/lib/types";

const statusClass = {
  approved: "bg-black text-white",
  pending: "bg-white text-black",
  rejected: "bg-zinc-200 text-black",
};

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [activeEmail, setActiveEmail] = useState("");
  const [error, setError] = useState("");
  const pendingUsers = users.filter((user) => user.status === "pending");
  // Rejected accounts are hidden from the list — only pending/approved show.
  const visibleUsers = users.filter((user) => user.status !== "rejected");

  async function verify(email: string, status: "approved" | "rejected") {
    setError("");
    setActiveEmail(email);
    const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      const result = (await response.json()) as { error?: string };
      setError(result.error || "Could not update this admin request.");
    }
    setActiveEmail("");
  }

  async function removeAccount(email: string, name: string) {
    const shouldRemove = window.confirm(
      `Remove ${name}'s admin account? They will no longer be able to sign in.`,
    );

    if (!shouldRemove) return;

    setError("");
    setActiveEmail(email);
    const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const result = (await response.json()) as { error?: string };
      setError(result.error || "Could not remove this admin account.");
    }
    setActiveEmail("");
  }

  return (
    <div className="border-2 border-black">
      <div className="border-b-2 border-black bg-black px-3 py-3 text-white">
        <p className="text-sm font-black uppercase tracking-[0.16em]">
          Admin account verification
        </p>
        <p className="mt-1 text-xs text-zinc-300">
          {pendingUsers.length === 0
            ? "No pending access requests right now."
            : `${pendingUsers.length} pending request${
                pendingUsers.length === 1 ? "" : "s"
              } need review.`}
        </p>
      </div>
      {error && (
        <p className="border-b-2 border-black bg-accent-soft p-3 text-sm font-bold" role="alert">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <caption className="border-b-2 border-black bg-black px-3 py-2 text-left text-sm font-black uppercase tracking-[0.16em] text-white">
          Account list
        </caption>
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase tracking-[0.14em]">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Requested</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {visibleUsers.length === 0 ? (
            <tr>
              <td className="p-6 text-center font-bold text-zinc-600" colSpan={6}>
                No admin accounts to show.
              </td>
            </tr>
          ) : (
            visibleUsers.map((user) => (
            <tr key={user.email}>
              <td className="p-3 font-bold">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 capitalize">{user.role.replace("_", " ")}</td>
              <td className="p-3">
                <span
                  className={`border border-black px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusClass[user.status]}`}
                >
                  {user.status}
                </span>
              </td>
              <td className="p-3">{formatDate(user.createdAt)}</td>
              <td className="p-3">
                {user.role === "admin" && user.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="border border-black bg-black px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-60"
                      type="button"
                      disabled={activeEmail === user.email}
                      onClick={() => verify(user.email, "approved")}
                    >
                      {activeEmail === user.email ? "Saving" : "Approve"}
                    </button>
                    <button
                      className="border border-black px-3 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-accent-soft disabled:cursor-wait disabled:opacity-60"
                      type="button"
                      disabled={activeEmail === user.email}
                      onClick={() => verify(user.email, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                ) : user.role === "admin" && user.status === "approved" ? (
                  <button
                    className="border border-black px-3 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-accent hover:text-white disabled:cursor-wait disabled:opacity-60"
                    type="button"
                    disabled={activeEmail === user.email}
                    onClick={() => removeAccount(user.email, user.name)}
                  >
                    {activeEmail === user.email ? "Removing" : "Remove"}
                  </button>
                ) : (
                  <span className="text-zinc-500">Reviewed</span>
                )}
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

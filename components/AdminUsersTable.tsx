"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import type { AdminUser } from "@/lib/types";

const statusClass = {
  approved: "bg-black text-white",
  pending: "bg-white text-black",
  rejected: "bg-zinc-200 text-black",
};

export function AdminUsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();

  async function verify(email: string, status: "approved" | "rejected") {
    const response = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="overflow-x-auto border-2 border-black">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <caption className="border-b-2 border-black bg-black px-3 py-2 text-left text-sm font-black uppercase tracking-[0.16em] text-white">
          Admin account verification
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
          {users.map((user) => (
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
                      className="cursor-pointer font-bold underline"
                      type="button"
                      onClick={() => verify(user.email, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="cursor-pointer font-bold underline"
                      type="button"
                      onClick={() => verify(user.email, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-zinc-500">Reviewed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      className="block w-full border-t border-white/40 px-4 py-3 text-left text-sm font-black uppercase tracking-[0.12em] hover:bg-white hover:text-black md:border-t-0"
      type="button"
      onClick={logout}
    >
      Logout
    </button>
  );
}

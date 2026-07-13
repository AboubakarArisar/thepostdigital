"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      className="block w-full border-t border-wheat-900 px-4 py-3 text-left text-sm font-black uppercase tracking-[0.12em] hover:bg-accent hover:text-white md:border-t-0"
      type="button"
      onClick={logout}
    >
      Logout
    </button>
  );
}

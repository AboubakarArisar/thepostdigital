"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

// Re-runs the dashboard's server render (dynamic = force-dynamic) so the
// audience numbers reload in place, without a full page navigation.
export function RefreshViewsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
      aria-label="Refresh visitor traffic"
      className="inline-flex cursor-pointer items-center gap-2 border-2 border-wheat-900 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition-colors hover:bg-accent hover:text-white disabled:pointer-events-none disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={isPending ? "animate-spin" : ""}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {isPending ? "Refreshing…" : "Refresh"}
    </button>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Records a public page view once per navigation. Admin routes are excluded so
// editorial staff don't inflate the audience numbers they're reviewing.
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}

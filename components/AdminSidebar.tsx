import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { SiteLogo } from "./SiteLogo";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/editor", label: "New story" },
  { href: "/search", label: "Archive" },
  { href: "/", label: "Public site" },
];

export function AdminSidebar() {
  return (
    <aside className="border-b-4 border-black bg-black text-white md:min-h-screen md:border-b-0 md:border-r-4">
      <div className="p-4">
        <Link href="/admin" aria-label="Post Desk dashboard" className="block w-fit">
          <SiteLogo className="h-10 w-44" tone="light" />
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-400">
          Editorial admin
        </p>
      </div>
      <nav className="flex overflow-x-auto border-t border-white/40 md:block">
        {adminLinks.map((link) => (
          <Link
            className="block shrink-0 border-r border-white/40 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] hover:bg-white hover:text-black md:border-b md:border-r-0"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
        <AdminLogoutButton />
      </nav>
    </aside>
  );
}

import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/editor", label: "New story" },
  { href: "/admin/archive", label: "Archive" },
];

export function AdminSidebar() {
  return (
    <aside className="border-b-4 border-wheat-900 bg-paper text-ink md:min-h-screen md:border-b-0 md:border-r-4">
      <div className="flex items-start justify-between gap-2 p-4">
        <div>
          <Link
            href="/admin"
            aria-label="Post Desk dashboard"
            className="block w-fit"
          >
            <SiteLogo className="h-10 w-44" />
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
            Editorial admin
          </p>
        </div>
        <ThemeToggle />
      </div>
      <nav className="flex overflow-x-auto border-t border-wheat-900 md:block">
        {adminLinks.map((link) => (
          <Link
            className="block shrink-0 border-r cursor-pointer border-wheat-900 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] hover:bg-accent hover:text-white md:border-b md:border-r-0"
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

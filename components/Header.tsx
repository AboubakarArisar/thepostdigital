import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { categories } from "@/lib/categories";
import type { Language } from "@/lib/types";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

const labels: Record<Language, { home: string; search: string }> = {
  en: { home: "Home", search: "Search" },
  ur: { home: "صفحہ اول", search: "تلاش" },
};

export async function Header({ language = "en" }: { language?: Language }) {
  const adminSession = await getAdminSession();
  const copy = labels[language];

  return (
    <header className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div aria-hidden="true" />
          <Link href="/" aria-label="The Post Digital home" className="block w-fit">
            <SiteLogo className="h-12 w-[min(70vw,20rem)] sm:h-14 sm:w-[24rem]" priority />
          </Link>
          <div className="flex items-center justify-end gap-2">
            {adminSession && (
              <Link
                href="/admin"
                className="border border-soft-rule px-2 py-1 text-[10px] font-black text-muted hover:border-rule hover:text-ink"
              >
                Admin
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="bg-accent text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3">
          <p className="text-4xl font-black leading-none">
            Breaking News
          </p>
        </div>
      </div>

      <nav aria-label="Primary" className="border-b border-soft-rule bg-elevated">
        <div className="scrollbar-none mx-auto flex max-w-7xl items-center justify-center gap-4 overflow-x-auto px-4 py-3 text-sm font-bold text-ink">
          <Link
            href={language === "en" ? "/?language=en" : "/"}
            className="shrink-0 hover:text-accent"
          >
            {copy.home}
          </Link>
          <Link
            href={language === "en" ? "/search?language=en" : "/search"}
            className="shrink-0 hover:text-accent"
          >
            {copy.search}
          </Link>
          {categories.map((category) => (
            <Link
              href={`/search?category=${category.slug}${language === "en" ? "&language=en" : ""}`}
              key={category.slug}
              className="shrink-0 hover:text-accent"
            >
              {category.name === "Technology" ? "Tech" : category.name}
            </Link>
          ))}
          <Link href="/about" className="shrink-0 hover:text-accent">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}

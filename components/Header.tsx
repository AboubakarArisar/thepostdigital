import Link from "next/link";
import { categories } from "@/lib/categories";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

const utilityLinks = [
  "Democracy Dies in Darkness",
  "Election 2026",
  "Markets",
  "World",
  "Climate",
  "Opinion",
  "Audio",
  "Games",
  "Cooking",
];

const alertLinks = ["Live updates", "Investigations"];

export function Header() {
  const today = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="border-b border-rule bg-paper">
      <div className="bg-chrome text-inverse">
        <nav
          aria-label="Network links"
          className="scrollbar-none mx-auto flex max-w-7xl justify-center gap-6 overflow-x-auto px-4 py-2 text-[11px] uppercase tracking-[0.08em]"
        >
          {utilityLinks.map((link) => (
            <a href="#" key={link} className="shrink-0 opacity-80 hover:opacity-100">
              {link}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-3 border-b border-soft-rule py-3 text-[11px] uppercase tracking-[0.1em] text-muted md:grid-cols-[1fr_auto_1fr]">
          <div className="hidden gap-3 md:flex">
            <Link href="/search" className="font-black text-ink hover:underline">
              Sections
            </Link>
            <Link href="/search?sort=latest" className="hover:text-ink">
              Latest
            </Link>
            <Link href="/about" className="hover:text-ink">
              About
            </Link>
          </div>
          <p className="text-center">{today}</p>
          <div className="flex items-center justify-center gap-2 md:justify-end">
            <Link href="/admin" className="font-black text-ink hover:underline sm:font-normal sm:text-muted sm:hover:text-ink sm:hover:no-underline">
              Admin
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-paper py-4 text-center sm:py-5">
          <Link
            href="/"
            aria-label="The Post Digital home"
            className="mx-auto block w-fit"
          >
            <SiteLogo className="h-14 w-[min(82vw,25rem)] sm:h-16 sm:w-[30rem]" priority />
          </Link>
          <p className="mx-auto mt-2 max-w-2xl text-[11px] uppercase tracking-[0.12em] text-muted">
            <Link href="/search" className="font-black text-ink hover:underline">
              National Edition
            </Link>{" "}
            <span aria-hidden="true">|</span> Independent reporting for Pakistan and the world
          </p>
        </div>

        <nav
          aria-label="Primary"
          className="scrollbar-none flex items-center gap-5 overflow-x-auto border-y border-rule bg-paper py-2.5 text-[12px] font-bold text-ink"
        >
          <Link href="/" className="shrink-0 hover:underline">
            Home
          </Link>
          <Link href="/search" className="shrink-0 hover:underline">
            Latest
          </Link>
          <Link href="/about" className="shrink-0 hover:underline">
            About
          </Link>
          {alertLinks.map((label) => (
            <Link
              href={`/search?q=${encodeURIComponent(label)}`}
              key={label}
              className="shrink-0 font-black text-accent hover:underline"
            >
              {label}
            </Link>
          ))}
          {categories.map((category) => (
            <Link
              href={`/search?category=${category.slug}`}
              key={category.slug}
              className="shrink-0 hover:underline"
            >
              {category.name === "Technology" ? "Tech" : category.name}
            </Link>
          ))}
          <Link href="/search?sort=popular" className="shrink-0 hover:underline">
            Popular
          </Link>
          <Link href="/search" className="shrink-0 hover:underline">
            Archive
          </Link>
          <Link
            href="/search"
            className="ml-auto flex shrink-0 items-center gap-2 text-muted hover:text-ink"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              &#9906;
            </span>
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}

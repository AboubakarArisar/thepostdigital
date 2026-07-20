import Link from "next/link";
import { categories } from "@/lib/data";
import { SiteLogo } from "./SiteLogo";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/admin/login" },
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-rule bg-paper text-ink">
      <div className="bg-chrome py-2 text-inverse">
        <div className="scrollbar-none mx-auto flex max-w-7xl justify-center gap-7 overflow-x-auto px-4 text-[12px] uppercase tracking-[0.04em]">
          {footerLinks.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="shrink-0 opacity-80 hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="border-b border-rule pb-6 text-center">
          <Link href="/" aria-label="The Post Digital home" className="mx-auto block w-fit">
            <SiteLogo className="h-12 w-[min(78vw,22rem)] sm:h-14 sm:w-[26rem]" />
          </Link>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            Independent bilingual reporting for Pakistan, built for careful
            reading and fast public record.
          </p>
        </div>

        <div className="grid gap-8 border-b border-rule py-6 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.14em]">
              Sections
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm uppercase">
              {categories.map((category) => (
                <Link
                  href={`/search?category=${category.slug}`}
                  key={category.slug}
                  className="hover:underline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.14em]">
              Newsletter
            </h2>
            <form className="mt-3 flex border border-rule">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Email address"
                className="min-w-0 flex-1 bg-paper px-3 py-2 text-sm text-ink outline-none"
              />
              <button
                type="button"
                className="border-l border-rule bg-chrome px-3 text-xs font-black uppercase tracking-[0.12em] text-inverse"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>

        {/* Partner backlink — for the linked site's SEO, not ours. */}
        <p className="border-b border-rule py-4 text-center text-xs leading-5 text-muted">
          Partner:{" "}
          <a
            href="https://www.consulics.com"
            target="_blank"
            rel="noopener"
            className="font-bold text-ink hover:underline"
          >
            Consulics | IRS Authorized Form 2290 &amp; HVUT E-File Provider
          </a>{" "}
          — Consulics is an IRS Authorized Form 2290 and Form 8849 e-file
          provider helping truck owners, fleets, and tax professionals file HVUT
          taxes online.
        </p>

        <div className="flex flex-col gap-2 py-4 text-center text-[12px] uppercase tracking-[0.08em] text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>Karachi / Lahore / Islamabad</p>
          <p>Copyright 2026 The Post Digital</p>
        </div>
      </div>
    </footer>
  );
}

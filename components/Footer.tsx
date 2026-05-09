import Link from "next/link";
import { categories } from "@/lib/data";

const footerLinks = [
  "Contact",
  "Advertise",
  "Privacy",
  "Terms",
  "Corrections",
  "Careers",
];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-rule bg-paper text-ink">
      <div className="bg-chrome py-2 text-inverse">
        <div className="scrollbar-none mx-auto flex max-w-7xl justify-center gap-7 overflow-x-auto px-4 text-[12px] uppercase tracking-[0.04em]">
          {footerLinks.map((link) => (
            <a href="#" key={link} className="shrink-0 opacity-80 hover:opacity-100">
              {link}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="border-b border-rule pb-6 text-center">
          <p className="font-serif-display text-4xl font-black leading-none sm:text-5xl">
            The Post Digital
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
            Independent bilingual reporting for Pakistan, built for careful
            reading and fast public record.
          </p>
        </div>

        <div className="grid gap-8 border-b border-rule py-6 md:grid-cols-[1fr_1fr_1fr]">
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
              Network
            </h2>
            <div className="mt-3 grid gap-2 text-sm uppercase">
              <a href="#">Epaper</a>
              <a href="#">Live TV</a>
              <a href="#">Post News Urdu</a>
              <a href="#">Images</a>
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

        <div className="flex flex-col gap-2 py-4 text-center text-[12px] uppercase tracking-[0.08em] text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>Karachi / Lahore / Islamabad</p>
          <p>Copyright 2026 The Post Digital</p>
        </div>
      </div>
    </footer>
  );
}

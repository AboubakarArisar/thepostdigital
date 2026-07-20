import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact The Post Digital newsroom with a news tip, a correction request, or a partnership enquiry.",
  alternates: { canonical: "/contact" },
};

const fieldClass =
  "w-full border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent";
const labelClass =
  "block text-xs font-black uppercase tracking-[0.14em] text-muted";

const channels = [
  { label: "Instagram", href: siteConfig.social[0] },
  { label: "YouTube", href: siteConfig.social[1] },
  { label: "TikTok", href: siteConfig.social[2] },
  { label: "X", href: siteConfig.social[3] },
];

export default function ContactPage() {
  return (
    <>
      <Header language="en" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <div className="border-b-2 border-rule pb-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">
            Newsroom
          </p>
          <h1 className="font-serif-display mt-2 text-4xl font-black leading-none text-ink sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Send us a news tip, ask for a correction, or get in touch about
            partnerships and advertising.
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Your name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className={labelClass}>
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                required
                className={`mt-1 ${fieldClass}`}
              />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={7}
                required
                className={`mt-1 ${fieldClass}`}
              />
            </div>

            {/* Deliberately disabled rather than a button that silently does
                nothing — a dead-but-clickable Send is worse than an honest one.
                Swap this for a real submit once the handler exists. */}
            <div>
              <button
                type="submit"
                disabled
                className="border-2 border-rule bg-chrome px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-inverse disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send message
              </button>
              <p className="mt-2 text-xs font-bold text-muted">
                Message sending is not connected yet. Until it is, please reach
                us on the channels listed here.
              </p>
            </div>
          </form>

          <aside className="border-t-2 border-rule pt-5 lg:border-l-2 lg:border-t-0 lg:pl-6 lg:pt-0">
            <h2 className="text-xs font-black uppercase tracking-[0.14em]">
              Reach the newsroom
            </h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {channels.map((channel) => (
                <li key={channel.href}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener"
                    className="font-bold text-ink underline underline-offset-2 hover:text-accent"
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-xs font-black uppercase tracking-[0.14em]">
              Offices
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Karachi / Lahore / Islamabad
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

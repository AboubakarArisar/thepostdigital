// Brand tones rather than a bordered box. X and TikTok use `bg-ink`/`text-paper`
// instead of a literal black, so their circles stay visible in dark mode where a
// black chip would disappear into the background.
const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/thepostdigitalpk",
    tone: "bg-[#1877f2] text-white",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.5 9 8.1 9.9v-7H7.9v-3h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.5l-.4 3h-2v7C18.5 21 22 16.9 22 12Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCzvrQhJQHOyF7eWpwbCuuow",
    tone: "bg-[#ff0000] text-white",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M21 8.4a3 3 0 0 0-2.1-2.1C17 5.8 12 5.8 12 5.8s-5 0-6.9.5A3 3 0 0 0 3 8.4 31 31 0 0 0 3 15.6a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-7.2Z" fill="currentColor" />
        <path d="m10 15 5.2-3L10 9v6Z" fill="#ff0000" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/the_post_digital",
    tone: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="7" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/thepostdigital2",
    tone: "bg-ink text-paper",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M4 4h4.2l4.2 5.7L17.2 4H20l-6.2 7.3L20.6 20h-4.2l-4.7-6.3L6.3 20H3.5l6.8-7.9L4 4Zm3 2 10.4 12h.6L7.6 6H7Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@thepostdigital1",
    tone: "bg-ink text-paper",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M15 4c.4 2.5 1.8 4 4 4.3v3a7 7 0 0 1-4-1.2v5.4a5 5 0 1 1-5-5c.4 0 .8 0 1.1.1v3.2a2 2 0 1 0 1 1.7V4h2.9Z" fill="currentColor" />
      </svg>
    ),
  },
];

export function SocialConnect() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="border-y border-rule py-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
          Social media
        </p>
        <h2 className="font-serif-display mt-1 text-3xl font-black text-ink sm:text-4xl">
          Connect with us
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
          Follow The Post Digital for breaking news and daily reporting in
          English and Urdu.
        </p>

        <ul className="mt-7 flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener"
                title={item.label}
                className={`grid h-12 w-12 place-items-center rounded-full shadow-sm transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${item.tone}`}
              >
                {item.icon}
                {/* The brand marks carry no text, so the link needs a name. */}
                <span className="sr-only">
                  {item.label} — opens in a new tab
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

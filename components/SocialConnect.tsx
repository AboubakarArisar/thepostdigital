const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/thepostdigitalpk",
    bg: "bg-[#1877f2]",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 4.9 3.5 9 8.1 9.9v-7H7.9v-3h2.2V9.8c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2v1.5h2.5l-.4 3h-2v7C18.5 21 22 16.9 22 12Z" fill="currentColor" />
      </svg>
    ),
  },
   {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCzvrQhJQHOyF7eWpwbCuuow",
    bg: "bg-[#ff0000]",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
        <path d="M21 8.4a3 3 0 0 0-2.1-2.1C17 5.8 12 5.8 12 5.8s-5 0-6.9.5A3 3 0 0 0 3 8.4 31 31 0 0 0 3 15.6a3 3 0 0 0 2.1 2.1c1.9.5 6.9.5 6.9.5s5 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 0-7.2Z" fill="currentColor" />
        <path d="m10 15 5.2-3L10 9v6Z" fill="#ff0000" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/the_post_digital",
    bg: "bg-[#d62976]",
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
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path d="M4 4h4.2l4.2 5.7L17.2 4H20l-6.2 7.3L20.6 20h-4.2l-4.7-6.3L6.3 20H3.5l6.8-7.9L4 4Zm3 2 10.4 12h.6L7.6 6H7Z" fill="currentColor" />
      </svg>
    ),
  },
 
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@thepostdigital1",
    bg: "bg-black",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
        <path d="M15 4c.4 2.5 1.8 4 4 4.3v3a7 7 0 0 1-4-1.2v5.4a5 5 0 1 1-5-5c.4 0 .8 0 1.1.1v3.2a2 2 0 1 0 1 1.7V4h2.9Z" fill="currentColor" />
      </svg>
    ),
  }
];

export function SocialConnect() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="border-y border-soft-rule py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Social media
            </p>
            <h2 className="mt-1 text-2xl font-black text-ink">Connect with us</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 border border-soft-rule bg-elevated px-3 py-2 text-sm font-black text-ink hover:border-rule"
              >
                <span>{item.label}</span>
                <span className={`grid h-10 w-10 place-items-center text-white ${item.bg}`}>
                  {item.icon}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

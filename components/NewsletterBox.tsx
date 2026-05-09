export function NewsletterBox() {
  return (
    <section className="border border-rule bg-elevated p-4">
      <h2 className="font-serif-display text-2xl font-black leading-none text-ink">
        Morning briefing
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        A concise digest of Pakistan, markets, politics, and world news.
      </p>
      <form className="mt-4 flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-[0.16em] text-ink" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          className="border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
          placeholder="reader@example.com"
        />
        <button className="border border-rule bg-chrome px-3 py-2 text-sm font-black uppercase tracking-[0.14em] text-inverse hover:bg-paper hover:text-ink">
          Subscribe
        </button>
      </form>
    </section>
  );
}

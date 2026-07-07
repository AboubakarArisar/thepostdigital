const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.thepostdigital.net";

export const siteConfig = {
  name: "The Post Digital",
  shortName: "The Post",
  title: "The Post Digital — Pakistan news in English & Urdu",
  description:
    "A responsive bilingual Pakistani digital newspaper with English and Urdu editorial coverage of politics, business, world, sports, and technology.",
  // Trailing slash stripped so we can safely template `${url}/path`.
  url: rawSiteUrl.replace(/\/+$/, ""),
  locale: "en_PK",
  // Official profiles — used in Organization `sameAs` so Google can tie the
  // brand name to this domain (helps brand-name search + knowledge panel).
  social: [
    "https://www.instagram.com/the_post_digital",
    "https://www.youtube.com/channel/UCzvrQhJQHOyF7eWpwbCuuow",
    "https://www.tiktok.com/@thepostdigital1",
    "https://x.com/thepostdigital2",
  ],
  keywords: [
    "Pakistan news",
    "Urdu news",
    "English news",
    "Pakistani newspaper",
    "politics",
    "business",
    "world",
    "sports",
    "technology",
    "The Post Digital",
  ],
};

export type SiteConfig = typeof siteConfig;

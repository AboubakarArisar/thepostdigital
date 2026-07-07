const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thepostdigital.com";

export const siteConfig = {
  name: "The Post Digital",
  shortName: "The Post",
  title: "The Post Digital — Pakistan news in English & Urdu",
  description:
    "A responsive bilingual Pakistani digital newspaper with English and Urdu editorial coverage of politics, business, world, sports, and technology.",
  // Trailing slash stripped so we can safely template `${url}/path`.
  url: rawSiteUrl.replace(/\/+$/, ""),
  locale: "en_PK",
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

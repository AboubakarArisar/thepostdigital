import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { getPublishedArticles } from "@/lib/data";
import { siteConfig } from "@/lib/site";

// Crawlers request the sitemap often. Cache it for an hour so each hit does not
// trigger a full-table read.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    {
      url: `${base}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/search?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.4,
  }));

  const articles = await getPublishedArticles().catch(() => []);
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${base}/article/${encodeURIComponent(article.slug)}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}

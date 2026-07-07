import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { getPublishedArticles } from "@/lib/data";
import { siteConfig } from "@/lib/site";

// Articles are stored in a runtime data store, so the sitemap is generated per
// request rather than at build time.
export const dynamic = "force-dynamic";

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

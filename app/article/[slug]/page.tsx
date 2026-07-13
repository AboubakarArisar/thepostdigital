import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleImage } from "@/components/ArticleImage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getPublishedArticleBySlug,
  getPublishedArticles,
  getRelatedArticles,
} from "@/lib/data";
import { articleTextClass, directionFor, formatDateTime } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

// Fetched by both generateMetadata and the page; cache() collapses it to one read.
const getArticle = cache(getPublishedArticleBySlug);

function articleDescription(article: Article) {
  const source = article.excerpt || article.body[0] || siteConfig.description;
  return source.length > 200 ? `${source.slice(0, 197).trimEnd()}…` : source;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Story not found", robots: { index: false, follow: false } };
  }

  const description = articleDescription(article);
  const canonical = `/article/${encodeURIComponent(article.slug)}`;
  const image = article.featuredImage || article.mediaUrl;

  return {
    title: article.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: `${siteConfig.url}${canonical}`,
      siteName: siteConfig.name,
      locale: article.language === "ur" ? "ur_PK" : "en_PK",
      publishedTime: article.publishedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const important = (await getPublishedArticles())
    .filter((item) => item.slug !== article.slug && item.language === article.language)
    .slice(0, 3);

  const canonicalUrl = `${siteConfig.url}/article/${encodeURIComponent(article.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: articleDescription(article),
    image: [article.featuredImage || article.mediaUrl].filter(Boolean),
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: article.language === "ur" ? "ur-PK" : "en-PK",
    articleSection: article.category,
    keywords: article.tags.join(", "),
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header language={article.language} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
          <aside className="order-2 space-y-4 lg:order-1">
            <h2
              dir={directionFor(article.language)}
              className={`text-3xl font-black text-ink ${
                article.language === "ur" ? "font-urdu text-right" : "text-left"
              }`}
            >
              {article.language === "ur" ? "اہم خبریں" : "Top stories"}
            </h2>
            {important.map((item) => (
              <ArticleCard article={item} compact key={item.slug} />
            ))}
          </aside>
        <article
          lang={article.language}
          dir={directionFor(article.language)}
          className={`order-1 ${articleTextClass(article)} lg:order-2`}
        >
          <h1 className="text-4xl font-black leading-snug text-ink sm:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-5 max-w-3xl text-xl leading-8 text-muted">
              {article.excerpt}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-muted">
            <span>{article.author}</span>
            <span>{formatDateTime(article.publishedAt)}</span>
          </div>
          <figure className="mt-6">
            <div className="bg-elevated">
              <ArticleImage article={article} fit="natural" />
            </div>
            {article.imageCaption && article.imageCaption !== article.excerpt && (
              <figcaption className="mt-2 border-b border-soft-rule pb-2 text-xs text-muted">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>
          <div className="mt-8">
            <ArticleBody article={article} />
          </div>
        </article>
        </div>

        <section className="mt-12 border-t border-soft-rule pt-8">
          <h2
            dir={directionFor(article.language)}
            className={`mb-5 text-3xl font-black text-ink ${
              article.language === "ur" ? "font-urdu text-right" : "text-left"
            }`}
          >
            {article.language === "ur" ? "متعلقہ خبریں" : "Related stories"}
          </h2>
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard article={item} horizontal key={item.slug} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

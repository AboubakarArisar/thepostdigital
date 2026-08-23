"use client";

import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleImage } from "@/components/ArticleImage";
import { articleTextClass, directionFor, formatDateTime } from "@/lib/format";
import type { Article } from "@/lib/types";

export default function AdminPreviewPage() {
  const [preview, setPreview] = useState<Partial<Article> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    queueMicrotask(() => {
      try {
        const raw =
          localStorage.getItem("admin_preview_article") ||
          sessionStorage.getItem("admin_preview_article");
        if (alive) setPreview(raw ? JSON.parse(raw) : null);
      } catch {
        if (alive) setPreview(null);
      } finally {
        if (alive) setReady(true);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  if (!preview) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <main className="py-10">
          <p className="mx-auto max-w-3xl px-4 font-bold">
            {ready
              ? "No preview available. Open the editor and click Preview."
              : "Loading preview..."}
          </p>
        </main>
      </div>
    );
  }

  const body = Array.isArray(preview.body)
    ? preview.body
    : [String(preview.body || "")].filter(Boolean);

  const article: Article = {
    title: preview.title || "(Untitled)",
    excerpt: preview.excerpt || "",
    body,
    language: preview.language === "ur" ? "ur" : "en",
    category: preview.category || "",
    contentType: preview.contentType || "news",
    tags: preview.tags || [],
    author: preview.author || "News Desk",
    mediaUrl: preview.mediaUrl || preview.featuredImage || "",
    featuredImage: preview.featuredImage || preview.mediaUrl || "",
    mediaType: preview.mediaType || "image",
    imageCaption: preview.excerpt || preview.title || "",
    status: "draft",
    publishedAt: preview.publishedAt || "",
    readingTime: 1,
    views: 0,
    isBreaking: false,
    isFeatured: false,
    slug: "preview",
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-7xl px-4 py-10">
        <article
          lang={article.language}
          dir={directionFor(article.language)}
          className={articleTextClass(article)}
        >
          <h1 className="text-4xl font-black leading-snug text-ink sm:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-5 max-w-3xl text-xl leading-8 text-muted">{article.excerpt}</p>
          )}
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-muted">
            <span>{article.author}</span>
            <span>{formatDateTime(article.publishedAt, article.language)}</span>
          </div>
          <div className="mt-6">
            {article.featuredImage && (
              <figure>
                <div className="overflow-hidden rounded-xl bg-elevated">
                  <ArticleImage article={article} fit="natural" />
                </div>
                {article.imageCaption && (
                  <figcaption className="mt-2 border-b border-soft-rule pb-2 text-xs text-muted">{article.imageCaption}</figcaption>
                )}
              </figure>
            )}
          </div>
          <div className="mt-8">
            <ArticleBody article={article} />
          </div>
        </article>
      </div>
    </main>
  );
}

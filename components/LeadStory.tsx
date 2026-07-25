import Link from "next/link";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { ArticleImage } from "./ArticleImage";

export function LeadStory({ article }: { article: Article }) {
  return (
    <article
      lang={article.language}
      dir={directionFor(article.language)}
      className={`border-b border-rule pb-5 ${articleTextClass(article)}`}
    >
      <Link
        href={`/article/${encodeURIComponent(article.slug)}`}
        className="block overflow-hidden rounded-xl border border-soft-rule bg-elevated"
      >
        <ArticleImage article={article} priority fit="natural" />
      </Link>
      <div className="mt-4">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-accent">
            Lead Story / {article.contentType} / {article.category}
          </p>
          <h1 className="font-serif-display text-3xl font-black leading-tight text-ink sm:text-4xl">
            <Link
              href={`/article/${encodeURIComponent(article.slug)}`}
              className="hover:underline"
            >
              {article.title}
            </Link>
          </h1>
          {article.excerpt && (
            <p className="mt-3 text-base leading-7 text-muted">
              {article.excerpt}
            </p>
          )}
        </div>
        <p className="mt-5 border-t border-soft-rule pt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
          {article.author} / {formatDate(article.publishedAt)} /{" "}
          {article.readingTime} min read
        </p>
      </div>
    </article>
  );
}

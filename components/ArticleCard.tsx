import Link from "next/link";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { ArticleImage } from "./ArticleImage";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
  hideExcerpt?: boolean;
  horizontal?: boolean;
};

export function ArticleCard({
  article,
  compact = false,
  hideExcerpt = false,
  horizontal = false,
}: ArticleCardProps) {
  const articleHref = `/article/${encodeURIComponent(article.slug)}`;

  // BBC-style list row on mobile (text beside a small thumbnail), reverting to
  // the normal vertical card — image on top — from the `sm` breakpoint up.
  if (horizontal) {
    return (
      <article
        lang={article.language}
        dir={directionFor(article.language)}
        className={`group flex gap-3 border-b border-soft-rule pb-5 sm:flex-col sm:gap-0 ${articleTextClass(article)}`}
      >
        <div className="min-w-0 flex-1 sm:flex-none sm:order-last">
          <h3 className="text-lg font-black leading-snug text-ink transition-colors group-hover:text-accent sm:text-xl">
            <Link href={articleHref} className="hover:underline">
              {article.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-muted">
            {formatDate(article.publishedAt)}
          </p>
        </div>
        <Link
          href={articleHref}
          className="block h-20 w-28 shrink-0 overflow-hidden bg-elevated sm:mb-3 sm:h-auto sm:w-full"
        >
          <ArticleImage article={article} fit="cover" className="sm:h-auto" />
        </Link>
      </article>
    );
  }

  return (
    <article
      lang={article.language}
      dir={directionFor(article.language)}
      className={`group border-b border-soft-rule pb-5 ${articleTextClass(article)}`}
    >
      {!compact && (
        <Link
          href={articleHref}
          className="mb-3 block overflow-hidden bg-elevated"
        >
          <ArticleImage article={article} fit="natural" />
        </Link>
      )}
      <h3
        className={`font-black leading-snug text-ink transition-colors group-hover:text-accent ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        <Link href={articleHref} className="hover:underline">
          {article.title}
        </Link>
      </h3>
      {!compact && !hideExcerpt && article.excerpt && (
        <p className="mt-2 text-sm leading-6 text-muted">{article.excerpt}</p>
      )}
      <p className="mt-2 text-sm text-muted">{formatDate(article.publishedAt)}</p>
    </article>
  );
}

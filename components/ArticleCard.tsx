import Link from "next/link";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { ArticleImage } from "./ArticleImage";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  const articleHref = `/article/${encodeURIComponent(article.slug)}`;

  return (
    <article
      lang={article.language}
      dir={directionFor(article.language)}
      className={`border-b border-soft-rule pb-5 ${articleTextClass(article)}`}
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
        className={`font-black leading-snug text-ink ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        <Link href={articleHref} className="hover:underline">
          {article.title}
        </Link>
      </h3>
      {!compact && article.excerpt && (
        <p className="mt-2 text-sm leading-6 text-muted">{article.excerpt}</p>
      )}
      <p className="mt-2 text-sm text-muted">{formatDate(article.publishedAt)}</p>
    </article>
  );
}

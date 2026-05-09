import Link from "next/link";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { ArticleImage } from "./ArticleImage";

type ArticleCardProps = {
  article: Article;
  compact?: boolean;
};

export function ArticleCard({ article, compact = false }: ArticleCardProps) {
  return (
    <article
      lang={article.language}
      dir={directionFor(article.language)}
      className={`border-b border-soft-rule pb-4 ${articleTextClass(article)}`}
    >
      {!compact && (
        <Link
          href={`/article/${article.slug}`}
          className="mb-3 block aspect-[4/3] overflow-hidden border border-soft-rule bg-elevated"
        >
          <ArticleImage article={article} />
        </Link>
      )}
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-black uppercase tracking-[0.14em] text-muted">
        <span className="text-accent">
          {article.contentType} / {article.category}
        </span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>
      <h3
        className={`font-serif-display text-xl font-black leading-tight text-ink ${
          compact ? "sm:text-lg" : "sm:text-xl"
        }`}
      >
        <Link href={`/article/${article.slug}`} className="hover:underline">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 text-[13px] leading-6 text-muted">{article.excerpt}</p>
    </article>
  );
}

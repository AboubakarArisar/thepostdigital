import Link from "next/link";
import { directionFor, formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";

export function SidebarLatest({ articles }: { articles: Article[] }) {
  return (
    <aside className="border border-rule bg-paper">
      <h2 className="border-b border-rule bg-chrome px-3 py-2 text-sm font-black uppercase tracking-[0.16em] text-inverse">
        Latest
      </h2>
      <div className="divide-y divide-soft-rule">
        {articles.map((article) => (
          <article
            key={article.slug}
            lang={article.language}
            dir={directionFor(article.language)}
            className={`p-3 ${article.language === "ur" ? "font-urdu text-right" : ""}`}
          >
            <Link
              href={`/article/${article.slug}`}
              className="font-serif-display text-base font-black leading-tight text-ink hover:underline"
            >
              {article.title}
            </Link>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              {article.category} / {formatDate(article.publishedAt)}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}

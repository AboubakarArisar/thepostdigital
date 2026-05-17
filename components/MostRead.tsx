import Link from "next/link";
import type { Article } from "@/lib/types";

export function MostRead({ articles }: { articles: Article[] }) {
  return (
    <aside className="border-t border-rule pt-3">
      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.16em] text-ink">
        Most Read
      </h2>
      <ol className="space-y-4">
        {articles.map((article, index) => (
          <li key={article.slug} className="grid grid-cols-[2rem_1fr] gap-3">
            <span className="font-serif-display text-2xl font-black text-accent">
              {index + 1}
            </span>
            <div lang={article.language} dir={article.language === "ur" ? "rtl" : "ltr"}>
              <Link
                href={`/article/${encodeURIComponent(article.slug)}`}
                className={`font-bold leading-snug hover:underline ${
                  article.language === "ur" ? "font-urdu text-right" : ""
                }`}
              >
                {article.title}
              </Link>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                {article.views.toLocaleString("en-PK")} views
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}

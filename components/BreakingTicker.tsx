import Link from "next/link";
import type { Article } from "@/lib/types";

export function BreakingTicker({ articles }: { articles: Article[] }) {
  return (
    <section
      aria-label="Breaking news"
      className="border-b border-rule bg-paper text-ink"
    >
      <div className="mx-auto flex max-w-7xl items-stretch px-4 text-sm">
        <div className="border-x border-rule bg-accent px-3 py-2 font-black uppercase tracking-[0.16em] text-white">
          Breaking
        </div>
        <div className="flex min-w-0 gap-6 overflow-hidden border-r border-rule px-3 py-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/article/${encodeURIComponent(article.slug)}`}
              className="shrink-0 font-semibold hover:underline"
            >
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

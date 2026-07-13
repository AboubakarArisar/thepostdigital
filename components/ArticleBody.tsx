import { directionFor } from "@/lib/format";
import type { Article } from "@/lib/types";

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div
      lang={article.language}
      dir={directionFor(article.language)}
      className={`article-body ${
        article.language === "ur" ? "font-urdu text-right" : "text-left"
      }`}
    >
      {article.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

import Image from "next/image";
import type { Article } from "@/lib/types";

type ArticleImageProps = {
  article: Article;
  priority?: boolean;
  className?: string;
  fit?: "cover" | "natural";
};

export function ArticleImage({
  article,
  priority = false,
  className = "",
  fit = "natural",
}: ArticleImageProps) {
  const fitClass =
    fit === "natural" ? "h-auto w-full" : "h-full w-full object-cover";

  if (article.mediaType === "video") {
    return (
      <video
        src={article.mediaUrl}
        poster={article.featuredImage}
        controls
        preload="metadata"
        className={`${fitClass} ${className}`}
      />
    );
  }

  return (
    <Image
      src={article.mediaUrl || article.featuredImage}
      alt={article.imageCaption || article.title}
      width={1400}
      height={900}
      unoptimized
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`${fitClass} ${className}`}
    />
  );
}

import Image from "next/image";
import type { Article } from "@/lib/types";

type ArticleImageProps = {
  article: Article;
  priority?: boolean;
  className?: string;
};

export function ArticleImage({
  article,
  priority = false,
  className = "",
}: ArticleImageProps) {
  if (article.mediaType === "video") {
    return (
      <video
        src={article.mediaUrl}
        poster={article.featuredImage}
        controls
        preload="metadata"
        className={`h-full w-full object-cover grayscale ${className}`}
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
      className={`h-full w-full object-cover grayscale ${className}`}
    />
  );
}

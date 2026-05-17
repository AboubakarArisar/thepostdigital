import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleImage } from "@/components/ArticleImage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getArchivedArticleBySlug } from "@/lib/data";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArchivedArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArchivedArticleBySlug(slug);

  if (!article) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <article
          lang={article.language}
          dir={directionFor(article.language)}
          className={articleTextClass(article)}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            Archived / {article.contentType} / {article.category}
          </p>
          <h1 className="font-serif-display mt-3 text-4xl font-black leading-tight text-ink sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-muted">
            {article.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 border-y border-rule py-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            <span>{article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readingTime} min read</span>
          </div>
          <figure className="mt-6">
            <div className="aspect-[16/9] overflow-hidden border border-soft-rule bg-elevated">
              <ArticleImage article={article} />
            </div>
            <figcaption className="mt-2 border-b border-soft-rule pb-2 text-xs text-muted">
              {article.imageCaption}
            </figcaption>
          </figure>
          <div className="mt-8">
            <ArticleBody article={article} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

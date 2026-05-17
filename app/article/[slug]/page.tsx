import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleImage } from "@/components/ArticleImage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  getPublishedArticleBySlug,
  getPublishedArticles,
  getRelatedArticles,
} from "@/lib/data";
import { articleTextClass, directionFor, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const important = (await getPublishedArticles())
    .filter((item) => item.slug !== article.slug && item.language === article.language)
    .slice(0, 3);

  return (
    <>
      <Header language={article.language} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
          <aside className="order-2 space-y-4 lg:order-1">
            <h2 className="text-right text-3xl font-black text-ink">
              اہم خبریں
            </h2>
            {important.map((item) => (
              <ArticleCard article={item} compact key={item.slug} />
            ))}
          </aside>
        <article
          lang={article.language}
          dir={directionFor(article.language)}
          className={`order-1 ${articleTextClass(article)} lg:order-2`}
        >
          <h1 className="text-4xl font-black leading-snug text-ink sm:text-6xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-8 text-muted">
            {article.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-muted">
            <span>{article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <figure className="mt-6">
            <div className="aspect-[16/9] overflow-hidden bg-elevated">
              <ArticleImage article={article} />
            </div>
            {article.imageCaption && article.imageCaption !== article.excerpt && (
              <figcaption className="mt-2 border-b border-soft-rule pb-2 text-xs text-muted">
                {article.imageCaption}
              </figcaption>
            )}
          </figure>
          <div className="mt-8">
            <ArticleBody article={article} />
          </div>
        </article>
        </div>

        <section className="mt-12 border-t border-soft-rule pt-8">
          <h2 className="mb-5 text-right text-3xl font-black text-ink">
            Related stories
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard article={item} key={item.slug} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

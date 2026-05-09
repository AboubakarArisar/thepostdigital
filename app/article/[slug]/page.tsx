import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleImage } from "@/components/ArticleImage";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getPublishedArticleBySlug, getRelatedArticles } from "@/lib/data";
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
            {article.contentType} / {article.category}
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
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_12rem]">
            <ArticleBody article={article} />
            <aside className="space-y-4 border-t border-rule pt-3 lg:border-l lg:border-t-0 lg:pl-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-ink">
                Share
              </p>
              {["X", "Facebook", "WhatsApp"].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="block w-full border border-rule px-3 py-2 text-sm font-black uppercase tracking-[0.12em] text-ink hover:bg-chrome hover:text-inverse"
                >
                  {label}
                </button>
              ))}
            </aside>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                href={`/search?q=${encodeURIComponent(tag)}`}
                key={tag}
                className="border border-rule px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-ink"
              >
                {tag}
              </Link>
            ))}
          </div>
        </article>

        <section className="mt-10 border-t border-rule pt-5">
          <h2 className="mb-5 font-serif-display text-4xl font-black text-ink">
            Related stories
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((item) => (
              <ArticleCard article={item} compact key={item.slug} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

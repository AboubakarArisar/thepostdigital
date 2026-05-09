import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { BreakingTicker } from "@/components/BreakingTicker";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LeadStory } from "@/components/LeadStory";
import { MostRead } from "@/components/MostRead";
import { NewsletterBox } from "@/components/NewsletterBox";
import { SidebarLatest } from "@/components/SidebarLatest";
import { formatCategories, getPublishedArticles } from "@/lib/data";

export default async function Home() {
  const published = await getPublishedArticles();
  const sectionArticles = formatCategories
    .map((category) => {
      const type =
        category.slug === "editorials"
          ? "editorial"
          : category.slug === "photos"
            ? "photo"
            : category.slug === "videos"
              ? "video"
              : "news";
      const article = published.find(
        (item) => item.category === category.name || item.contentType === type,
      );

      return article ? { category, article } : null;
    })
    .filter((item) => item !== null);

  if (published.length === 0) {
    return (
      <>
        <Header />
        <main className="mx-auto grid w-full max-w-4xl flex-1 place-items-center px-4 py-20 text-center">
          <section className="border-2 border-rule p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              No published stories
            </p>
            <h1 className="font-serif-display mt-3 text-4xl font-black text-ink">
              The public edition is waiting for the desk.
            </h1>
            <p className="mt-3 text-muted">
              Publish a story from the protected admin portal to fill the front
              page.
            </p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const lead = published.find((article) => article.isFeatured) ?? published[0];
  const secondary = published.filter((article) => article.slug !== lead.slug).slice(0, 4);
  const latest = [...published]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 5);
  const mostRead = [...published].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <>
      <Header />
      <BreakingTicker articles={published.filter((article) => article.isBreaking)} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <section className="mb-5 border-b border-rule pb-3 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-accent">
            Today&apos;s Paper
          </p>
          <h1 className="font-serif-display mt-1 text-2xl font-black leading-tight text-ink sm:text-4xl">
            Essential reporting, analysis and opinion
          </h1>
        </section>

        <div className="grid gap-5 lg:grid-cols-[17rem_1fr_18rem]">
          <aside className="space-y-5 border-b border-rule pb-5 lg:border-b-0 lg:border-r lg:pr-5">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
              Top Stories
            </h2>
            {secondary.slice(0, 3).map((article) => (
              <ArticleCard article={article} compact key={article.slug} />
            ))}
          </aside>

          <section>
            <LeadStory article={lead} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {secondary.slice(0, 2).map((article) => (
                <ArticleCard article={article} key={article.slug} />
              ))}
            </div>
          </section>

          <div className="space-y-6 border-t border-rule pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <SidebarLatest articles={latest} />
            <MostRead articles={mostRead} />
            <NewsletterBox />
          </div>
        </div>

        <section className="mt-10 border-t border-rule pt-5">
          <h2 className="mb-5 font-serif-display text-4xl font-black text-ink">
            Sections
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sectionArticles.length === 0 ? (
              <div className="border border-rule p-4 md:col-span-2 lg:col-span-4">
                <p className="text-sm font-bold text-muted">
                  No category stories are available yet. Publish news,
                  editorials, photos, or videos from the admin desk to fill
                  these sections.
                </p>
              </div>
            ) : (
              sectionArticles.map(({ category, article }) => {
              return (
                <div key={category.slug}>
                  <p className="mb-3 border-b border-rule pb-2 text-xs font-black uppercase tracking-[0.16em] text-accent">
                    {category.name}
                  </p>
                  <ArticleCard article={article} compact />
                </div>
              );
              })
            )}
          </div>
        </section>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-rule bg-paper text-center text-[10px] font-black uppercase tracking-[0.12em] text-ink md:hidden">
        <Link className="border-r border-rule py-3" href="/">
          Home
        </Link>
        <Link className="border-r border-rule py-3" href="/search">
          Search
        </Link>
        <Link className="border-r border-rule py-3" href="/admin">
          Desk
        </Link>
        <Link className="py-3" href="/admin/editor">
          Write
        </Link>
      </nav>
      <Footer />
    </>
  );
}

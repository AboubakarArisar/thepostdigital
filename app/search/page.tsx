import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsletterBox } from "@/components/NewsletterBox";
import { categories } from "@/lib/categories";
import { getArticles } from "@/lib/data";

export default async function SearchPage() {
  const articles = await getArticles();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="font-serif-display text-4xl font-black leading-none text-ink sm:text-5xl">
          Search the archive
        </h1>
        <div className="mt-6 border-y border-rule py-5">
          <label htmlFor="archive-search" className="editor-label">
            Search
          </label>
          <input
            id="archive-search"
            type="search"
            className="w-full border border-rule bg-paper px-4 py-3 text-2xl font-black text-ink outline-none focus:ring-2 focus:ring-accent"
            placeholder="Politics, Karachi, rupee..."
          />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <select aria-label="Category filter" className="border border-rule bg-paper px-3 py-2 text-ink">
              <option>All categories</option>
              {categories.map((category) => (
                <option key={category.slug}>{category.name}</option>
              ))}
            </select>
            <select aria-label="Language filter" className="border border-rule bg-paper px-3 py-2 text-ink">
              <option>All languages</option>
              <option>English</option>
              <option>Urdu</option>
            </select>
            <select aria-label="Date filter" className="border border-rule bg-paper px-3 py-2 text-ink">
              <option>Any date</option>
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
            <select aria-label="Status filter" className="border border-rule bg-paper px-3 py-2 text-ink">
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <section className="space-y-6">
            {articles.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </section>
          <aside className="space-y-6">
            <section className="border border-rule bg-elevated p-4">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
                Categories
              </h2>
              <div className="mt-3 grid gap-2 text-sm font-bold">
                {categories.map((category) => (
                  <a href={`/search?category=${category.slug}`} key={category.slug}>
                    {category.name}
                  </a>
                ))}
              </div>
            </section>
            <section className="border-t border-rule pt-3">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-ink">
                Archive
              </h2>
              <div className="mt-3 grid gap-2 text-sm font-bold">
                <a href="/search?date=2026-05">May 2026</a>
                <a href="/search?date=2026-04">April 2026</a>
                <a href="/search?date=2026-03">March 2026</a>
              </div>
            </section>
            <NewsletterBox />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

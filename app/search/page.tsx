import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { NewsletterBox } from "@/components/NewsletterBox";
import { SearchFilters } from "@/components/SearchFilters";
import { categories } from "@/lib/categories";
import { getArticles } from "@/lib/data";
import type { Article, ArticleStatus, Language } from "@/lib/types";

type SearchParams = Promise<{
  category?: string | string[] | undefined;
  date?: string | string[] | undefined;
  language?: string | string[] | undefined;
  q?: string | string[] | undefined;
  sort?: string | string[] | undefined;
  status?: string | string[] | undefined;
}>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isLanguage(value: string | undefined): value is Language {
  return value === "en" || value === "ur";
}

function isStatus(value: string | undefined): value is ArticleStatus {
  return (
    value === "draft" ||
    value === "pending_approval" ||
    value === "published" ||
    value === "scheduled"
  );
}

function matchesCategory(article: Article, categorySlug: string) {
  const category = categories.find((item) => item.slug === categorySlug);

  if (!category) return true;

  if (category.group === "format") {
    const contentType =
      category.slug === "editorials"
        ? "editorial"
        : category.slug === "photos"
          ? "photo"
          : category.slug === "videos"
            ? "video"
            : "news";

    return (
      article.contentType === contentType ||
      article.category.toLowerCase() === category.name.toLowerCase()
    );
  }

  return article.category.toLowerCase() === category.name.toLowerCase();
}

function matchesDate(article: Article, dateFilter: string) {
  if (!dateFilter) return true;

  const publishedAt = new Date(article.publishedAt);
  const now = new Date();

  if (/^\d{4}-\d{2}$/.test(dateFilter)) {
    return article.publishedAt.startsWith(dateFilter);
  }

  if (dateFilter === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return publishedAt >= weekAgo;
  }

  if (dateFilter === "month") {
    return (
      publishedAt.getMonth() === now.getMonth() &&
      publishedAt.getFullYear() === now.getFullYear()
    );
  }

  if (dateFilter === "year") {
    return publishedAt.getFullYear() === now.getFullYear();
  }

  return true;
}

function matchesQuery(article: Article, query: string) {
  if (!query) return true;

  const searchText = [
    article.title,
    article.excerpt,
    article.author,
    article.category,
    article.contentType,
    article.tags.join(" "),
    article.body.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return searchText.includes(query.toLowerCase());
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const articles = await getArticles();
  const params = await searchParams;
  const selectedCategory = firstParam(params.category) ?? "";
  const selectedDate = firstParam(params.date) ?? "";
  const selectedLanguage = firstParam(params.language) ?? "en";
  const selectedStatus = firstParam(params.status) ?? "published";
  const query = firstParam(params.q) ?? "";
  const sort = firstParam(params.sort) ?? "";
  const language = isLanguage(selectedLanguage) ? selectedLanguage : "en";
  const status = isStatus(selectedStatus) ? selectedStatus : "";
  const filteredArticles = articles
    .filter((article) => matchesQuery(article, query))
    .filter((article) => !selectedCategory || matchesCategory(article, selectedCategory))
    .filter((article) => !language || article.language === language)
    .filter((article) => !status || article.status === status)
    .filter((article) => matchesDate(article, selectedDate))
    .sort((a, b) => {
      if (sort === "popular") return b.views - a.views;
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="font-serif-display text-4xl font-black leading-none text-ink sm:text-5xl">
          Search the archive
        </h1>
        <SearchFilters
          categories={categories}
          query={query}
          selectedCategory={selectedCategory}
          selectedDate={selectedDate}
          selectedLanguage={language}
          selectedStatus={status}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
          <section className="space-y-6">
            <p className="border-b border-soft-rule pb-3 text-xs font-black uppercase tracking-[0.16em] text-muted">
              {filteredArticles.length} result{filteredArticles.length === 1 ? "" : "s"}
            </p>
            {filteredArticles.length === 0 ? (
              <div className="border border-rule bg-elevated p-5">
                <p className="text-sm font-bold text-muted">
                  No stories match these filters. Try another language,
                  category, date, or search term.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <ArticleCard
                  article={article}
                  key={`${article.slug}-${article.publishedAt}`}
                />
              ))
            )}
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

import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Pagination } from "@/components/Pagination";
import { SearchFilters } from "@/components/SearchFilters";
import { categories } from "@/lib/categories";
import { getCards } from "@/lib/data";
import type { Article, Language } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  category?: string | string[] | undefined;
  date?: string | string[] | undefined;
  language?: string | string[] | undefined;
  q?: string | string[] | undefined;
  sort?: string | string[] | undefined;
  page?: string | string[] | undefined;
}>;

const RESULTS_PER_PAGE = 12;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isLanguage(value: string | undefined): value is Language {
  return value === "en" || value === "ur";
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


export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedCategory = firstParam(params.category) ?? "";
  const selectedDate = firstParam(params.date) ?? "";
  const selectedLanguage = firstParam(params.language) ?? "ur";
  const query = firstParam(params.q) ?? "";
  const sort = firstParam(params.sort) ?? "";
  const language = isLanguage(selectedLanguage) ? selectedLanguage : "ur";
  // Text search (ILIKE, incl. body), language, and live-only run in SQL and
  // return body-stripped cards. Category/date/sort refine that small set here.
  const baseCards = await getCards({
    liveOnly: true,
    language,
    search: query || undefined,
  });
  const filteredArticles = baseCards
    .filter((article) => !selectedCategory || matchesCategory(article, selectedCategory))
    .filter((article) => matchesDate(article, selectedDate))
    .sort((a, b) => {
      if (sort === "popular") return b.views - a.views;
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredArticles.length / RESULTS_PER_PAGE),
  );
  const requestedPage = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const currentPage = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  );
  const pageResults = filteredArticles.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE,
  );
  const createHref = (page: number) => {
    const search = new URLSearchParams();
    if (selectedCategory) search.set("category", selectedCategory);
    if (selectedDate) search.set("date", selectedDate);
    if (language) search.set("language", language);
    if (query) search.set("q", query);
    if (sort) search.set("sort", sort);
    if (page > 1) search.set("page", String(page));
    const qs = search.toString();
    return qs ? `/search?${qs}` : "/search";
  };

  return (
    <>
      <Header language={language} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1
          dir={language === "ur" ? "rtl" : "ltr"}
          className={`text-4xl font-black leading-none text-ink sm:text-5xl ${language === "ur" ? "font-urdu text-right" : ""}`}
        >
          {language === "ur" ? "تلاش" : "Search"}
        </h1>
        <SearchFilters
          categories={categories}
          query={query}
          selectedCategory={selectedCategory}
          selectedDate={selectedDate}
          selectedLanguage={language}
        />

        <div className="mt-8">
          <section>
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
              <>
                <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {pageResults.map((article) => (
                    <ArticleCard
                      article={article}
                      key={`${article.slug}-${article.publishedAt}`}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  createHref={createHref}
                  language={language}
                />
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

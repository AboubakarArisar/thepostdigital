import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ArticleImage } from "@/components/ArticleImage";
import { Pagination } from "@/components/Pagination";
import { SocialConnect } from "@/components/SocialConnect";
import { getAdminSession } from "@/lib/auth";
import { getPublishedArticles } from "@/lib/data";
import { directionFor, formatDate } from "@/lib/format";
import type { Language } from "@/lib/types";

// The homepage reads ?language, so it is always dynamically rendered. The heavy
// DB read it triggers is cached at the data layer (see lib/data.ts getArticles),
// which is what actually keeps crawler traffic off Neon.
export const dynamic = "force-dynamic";

type HomeSearchParams = Promise<{
  language?: string | string[] | undefined;
  page?: string | string[] | undefined;
}>;

const MORE_STORIES_PER_PAGE = 12;

function normalizePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
}

const languageOptions: Array<{
  label: string;
  value: Language;
  href: string;
}> = [
  { label: "EN", value: "en", href: "/?language=en" },
  { label: "اردو", value: "ur", href: "/" },
];

function normalizeLanguage(value: string | string[] | undefined) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected === "en" ? selected : "ur";
}

function LanguageSwitcher({
  selectedLanguage,
  counts,
}: {
  selectedLanguage: Language;
  counts: Record<Language, number>;
}) {
  const selectedLabel =
    languageOptions.find((option) => option.value === selectedLanguage)?.label ??
    "اردو";

  return (
    <div className="mx-auto mt-5 w-full max-w-lg">
      <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted">
        <span className="h-px w-8 bg-soft-rule" aria-hidden="true" />
        <span>
          {selectedLabel} / {counts[selectedLanguage]} stories
        </span>
        <span className="h-px w-8 bg-soft-rule" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-[8px] border border-soft-rule bg-elevated p-1 shadow-sm">
        {languageOptions.map((option) => {
          const isActive = option.value === selectedLanguage;

          return (
            <Link
              key={option.value}
              href={option.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-2 text-center transition ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:bg-accent-soft hover:text-ink"
              }`}
            >
              <span className="text-[11px] font-black uppercase tracking-[0.1em] sm:text-xs">
                {option.label}
              </span>
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-[4px] px-1 text-[10px] font-black ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-paper text-muted group-hover:text-accent"
                }`}
              >
                {counts[option.value]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const adminSession = await getAdminSession();
  const allPublished = await getPublishedArticles();
  const params = await searchParams;
  const selectedLanguage = normalizeLanguage(params.language);
  const languageCounts = {
    en: allPublished.filter((article) => article.language === "en").length,
    ur: allPublished.filter((article) => article.language === "ur").length,
  };
  const published = allPublished.filter(
    (article) => article.language === selectedLanguage,
  );

  if (allPublished.length === 0) {
    return (
      <>
        <Header language={selectedLanguage} />
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

  if (published.length === 0) {
    const selectedLabel = selectedLanguage === "ur" ? "اردو" : "EN";

    return (
      <>
        <Header language={selectedLanguage} />
        <main className="mx-auto grid w-full max-w-4xl flex-1 place-items-center px-4 py-20 text-center">
          <section className="border-2 border-rule p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Language filter
            </p>
            <h1 className="font-serif-display mt-3 text-4xl font-black text-ink">
              No {selectedLabel} stories are published yet.
            </h1>
            <p className="mt-3 text-muted">
              Choose another language or publish a story in this language from
              the admin desk.
            </p>
            <LanguageSwitcher
              counts={languageCounts}
              selectedLanguage={selectedLanguage}
            />
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Highest priority wins the lead slot; ties (incl. the default 0) fall back
  // to newest-first, so untouched stories behave exactly as before.
  const ranked = [...published].sort(
    (a, b) =>
      (b.priority ?? 0) - (a.priority ?? 0) ||
      +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
  const lead = ranked[0];
  const secondary = ranked.slice(1);
  const heroCards = secondary.slice(0, 4);

  // Everything past the hero is paginated. The hero (lead + 4 cards) only
  // appears on the first page; later pages are a plain grid of more stories.
  const moreStoriesPool = secondary.slice(4);
  const totalPages = Math.max(
    1,
    Math.ceil(moreStoriesPool.length / MORE_STORIES_PER_PAGE),
  );
  const currentPage = Math.min(normalizePage(params.page), totalPages);
  const showHero = currentPage === 1;
  const pageStories = moreStoriesPool.slice(
    (currentPage - 1) * MORE_STORIES_PER_PAGE,
    currentPage * MORE_STORIES_PER_PAGE,
  );
  const createHref = (page: number) => {
    const query = new URLSearchParams();
    if (selectedLanguage === "en") query.set("language", "en");
    if (page > 1) query.set("page", String(page));
    const qs = query.toString();
    return qs ? `/?${qs}` : "/";
  };

  const leadTextClass =
    lead.language === "ur" ? "font-urdu text-right" : "text-left";
  const leadBlock = (
    <>
      <Link
        href={`/article/${encodeURIComponent(lead.slug)}`}
        className="block bg-elevated"
      >
        <ArticleImage article={lead} priority fit="natural" />
      </Link>
      <h2 className="mt-5 text-3xl font-black leading-snug text-ink sm:text-4xl">
        <Link
          href={`/article/${encodeURIComponent(lead.slug)}`}
          className="hover:underline"
        >
          {lead.title}
        </Link>
      </h2>
      {lead.excerpt && (
        <p className="mt-3 text-lg leading-8 text-muted">{lead.excerpt}</p>
      )}
      <p className="mt-3 text-sm text-muted">{formatDate(lead.publishedAt)}</p>
    </>
  );

  return (
    <>
      <Header language={selectedLanguage} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <h1 className="sr-only">
          {selectedLanguage === "ur" ? "تازہ خبریں" : "Latest news"}
        </h1>
        {/* Commercial slot — left empty for now; drop the ad embed here. */}
        <section className="mb-8 min-h-[90px]" aria-hidden="true" />

        {showHero &&
          (heroCards.length > 0 ? (
            <section
              dir={directionFor(selectedLanguage)}
              className="grid gap-x-8 gap-y-10 lg:grid-cols-2"
            >
              <article
                lang={lead.language}
                dir={directionFor(lead.language)}
                className={`lg:order-1 ${leadTextClass}`}
              >
                {leadBlock}
              </article>
              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:order-2">
                {heroCards.map((article) => (
                  <ArticleCard article={article} horizontal key={article.slug} />
                ))}
              </div>
            </section>
          ) : (
            <section className="mx-auto max-w-3xl">
              <article
                lang={lead.language}
                dir={directionFor(lead.language)}
                className={leadTextClass}
              >
                {leadBlock}
              </article>
            </section>
          ))}

        {pageStories.length > 0 && (
          <section className={showHero ? "mt-12 border-t border-soft-rule pt-8" : ""}>
            <h2
              dir={selectedLanguage === "ur" ? "rtl" : "ltr"}
              className={`mb-6 text-3xl font-black text-ink ${selectedLanguage === "ur" ? "font-urdu text-right" : ""}`}
            >
              {selectedLanguage === "ur" ? "مزید خبریں" : "More stories"}
            </h2>
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {pageStories.map((article) => (
                <ArticleCard article={article} horizontal key={article.slug} />
              ))}
            </div>
          </section>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          createHref={createHref}
          language={selectedLanguage}
        />
      </main>
      <nav className={`fixed inset-x-0 bottom-0 z-10 grid border-t border-rule bg-paper text-center text-[10px] font-black uppercase tracking-[0.12em] text-ink md:hidden ${adminSession ? "grid-cols-4" : "grid-cols-2"}`}>
        <Link
          className={`border-r border-rule py-3 ${selectedLanguage === "ur" ? "font-urdu" : ""}`}
          href={selectedLanguage === "en" ? "/?language=en" : "/"}
        >
          {selectedLanguage === "ur" ? "صفحہ اول" : "Home"}
        </Link>
        <Link
          className={`${adminSession ? "border-r border-rule py-3" : "py-3"} ${selectedLanguage === "ur" ? "font-urdu" : ""}`}
          href={selectedLanguage === "en" ? "/search?language=en" : "/search"}
        >
          {selectedLanguage === "ur" ? "تلاش" : "Search"}
        </Link>
        {adminSession && (
          <>
            <Link className="border-r border-rule py-3" href="/admin">
              Desk
            </Link>
            <Link className="py-3" href="/admin/editor">
              Write
            </Link>
          </>
        )}
      </nav>
      <SocialConnect />
      <Footer />
    </>
  );
}

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
import type { Language } from "@/lib/types";

type HomeSearchParams = Promise<{
  language?: string | string[] | undefined;
}>;

type SelectedLanguage = "all" | Language;

const languageOptions: Array<{
  label: string;
  shortLabel: string;
  value: SelectedLanguage;
  href: string;
}> = [
  { label: "All editions", shortLabel: "All", value: "all", href: "/" },
  { label: "English", shortLabel: "EN", value: "en", href: "/?language=en" },
  { label: "Urdu", shortLabel: "UR", value: "ur", href: "/?language=ur" },
];

function normalizeLanguage(value: string | string[] | undefined) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected === "en" || selected === "ur" ? selected : "all";
}

function LanguageSwitcher({
  selectedLanguage,
  counts,
}: {
  selectedLanguage: SelectedLanguage;
  counts: Record<SelectedLanguage, number>;
}) {
  const selectedLabel =
    languageOptions.find((option) => option.value === selectedLanguage)?.label ??
    "All editions";

  return (
    <div className="mx-auto mt-5 w-full max-w-lg">
      <div className="mb-2 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-muted">
        <span className="h-px w-8 bg-soft-rule" aria-hidden="true" />
        <span>
          {selectedLabel} / {counts[selectedLanguage]} stories
        </span>
        <span className="h-px w-8 bg-soft-rule" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-[8px] border border-soft-rule bg-elevated p-1 shadow-sm">
        {languageOptions.map((option) => {
          const isActive = option.value === selectedLanguage;

          return (
            <Link
              key={option.value}
              href={option.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex min-h-11 items-center justify-center gap-2 rounded-[6px] px-2 text-center transition ${
                isActive
                  ? "bg-chrome text-inverse shadow-sm"
                  : "text-muted hover:bg-accent-soft hover:text-ink"
              }`}
            >
              <span className="hidden text-[10px] font-black uppercase tracking-[0.14em] opacity-70 sm:inline">
                {option.shortLabel}
              </span>
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
  const allPublished = await getPublishedArticles();
  const selectedLanguage = normalizeLanguage((await searchParams).language);
  const languageCounts = {
    all: allPublished.length,
    en: allPublished.filter((article) => article.language === "en").length,
    ur: allPublished.filter((article) => article.language === "ur").length,
  };
  const published =
    selectedLanguage === "all"
      ? allPublished
      : allPublished.filter((article) => article.language === selectedLanguage);
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

  if (allPublished.length === 0) {
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

  if (published.length === 0) {
    const selectedLabel =
      selectedLanguage === "ur" ? "Urdu" : selectedLanguage === "en" ? "English" : "selected";

    return (
      <>
        <Header />
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
          <LanguageSwitcher
            counts={languageCounts}
            selectedLanguage={selectedLanguage}
          />
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

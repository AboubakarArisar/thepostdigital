import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ArticleImage } from "@/components/ArticleImage";
import { SocialConnect } from "@/components/SocialConnect";
import { getAdminSession } from "@/lib/auth";
import { getPublishedArticles } from "@/lib/data";
import { directionFor, formatDate } from "@/lib/format";
import type { Language } from "@/lib/types";

type HomeSearchParams = Promise<{
  language?: string | string[] | undefined;
}>;

const languageOptions: Array<{
  label: string;
  value: Language;
  href: string;
}> = [
  { label: "EN", value: "en", href: "/?language=en" },
  { label: "UR", value: "ur", href: "/" },
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
    "UR";

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
  const selectedLanguage = normalizeLanguage((await searchParams).language);
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
    const selectedLabel = selectedLanguage === "ur" ? "UR" : "EN";

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

  const latest = [...published]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
  const lead = latest.find((article) => article.isFeatured) ?? latest[0];
  const secondary = latest.filter((article) => article.slug !== lead.slug);
  const featureCards = secondary.slice(0, 2);
  const moreStories = secondary.slice(2);

  return (
    <>
      <Header language={selectedLanguage} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <section className="mb-8 border-b border-soft-rule pb-5 text-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-accent">
              {selectedLanguage === "ur" ? "تازہ" : "Latest"}
            </p>
            <h1
              dir={selectedLanguage === "ur" ? "rtl" : "ltr"}
              className={`mt-1 text-3xl font-black leading-tight text-ink sm:text-5xl ${selectedLanguage === "ur" ? "font-urdu" : ""}`}
            >
              {selectedLanguage === "ur" ? "تازہ خبریں" : "Latest news"}
            </h1>
          </div>
          <LanguageSwitcher
            counts={languageCounts}
            selectedLanguage={selectedLanguage}
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            {featureCards.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
          <article
            lang={lead.language}
            dir={directionFor(lead.language)}
            className={lead.language === "ur" ? "font-urdu text-right" : "text-left"}
          >
            <Link
              href={`/article/${encodeURIComponent(lead.slug)}`}
              className="block aspect-[16/9] overflow-hidden bg-elevated"
            >
              <ArticleImage article={lead} priority />
            </Link>
            <h2 className="mt-5 text-3xl font-black leading-snug text-ink sm:text-5xl">
              <Link href={`/article/${encodeURIComponent(lead.slug)}`} className="hover:underline">
                {lead.title}
              </Link>
            </h2>
            <p className="mt-3 text-lg leading-8 text-muted">{lead.excerpt}</p>
            <p className="mt-3 text-sm text-muted">{formatDate(lead.publishedAt)}</p>
          </article>
        </section>

        <section className="mt-12 border-t border-soft-rule pt-8">
          <h2
            dir={selectedLanguage === "ur" ? "rtl" : "ltr"}
            className={`mb-6 text-3xl font-black text-ink ${selectedLanguage === "ur" ? "font-urdu text-right" : ""}`}
          >
            {selectedLanguage === "ur" ? "مزید خبریں" : "More stories"}
          </h2>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {moreStories.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        </section>
      </main>
      <nav className={`fixed inset-x-0 bottom-0 z-10 grid border-t border-rule bg-paper text-center text-[10px] font-black uppercase tracking-[0.12em] text-ink md:hidden ${adminSession ? "grid-cols-4" : "grid-cols-2"}`}>
        <Link className="border-r border-rule py-3" href="/">
          Home
        </Link>
        <Link className={adminSession ? "border-r border-rule py-3" : "py-3"} href="/search">
          Search
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

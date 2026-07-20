import Link from "next/link";
import { categories } from "@/lib/categories";
import { getPublishedArticles } from "@/lib/data";
import { formatToday } from "@/lib/format";
import type { Language } from "@/lib/types";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

const labels: Record<
  Language,
  { home: string; search: string; about: string; contact: string }
> = {
  en: { home: "Home", search: "Search", about: "About", contact: "Contact" },
  ur: {
    home: "صفحہ اول",
    search: "تلاش",
    about: "ہمارے بارے میں",
    contact: "رابطہ",
  },
};

export async function Header({ language = "en" }: { language?: Language }) {
  const articles = await getPublishedArticles();
  const recentArticles = [...articles]
    .filter((article) => article.language === language)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 2);
  const copy = labels[language];

  return (
    <header className="bg-paper">
      {/* Utility strip — language + theme on the left, date pinned to the right
          for both languages. Flex-wraps on small screens so it never overflows. */}
      <div className="border-b border-soft-rule bg-elevated">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-full border border-soft-rule bg-paper p-0.5 text-[11px] font-black">
              <Link
                href="/?language=en"
                aria-current={language === "en" ? "page" : undefined}
                className={`inline-flex h-6 w-11 items-center justify-center rounded-full leading-none ${language === "en" ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
              >
                EN
              </Link>
              <Link
                href="/"
                aria-current={language === "ur" ? "page" : undefined}
                className={`inline-flex h-6 w-11 items-center justify-center rounded-full font-urdu leading-none ${language === "ur" ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
              >
                اردو
              </Link>
            </div>
            <ThemeToggle />
          </div>
          <span
            dir={language === "ur" ? "rtl" : "ltr"}
            className={`text-sm font-bold text-muted sm:text-base ${language === "ur" ? "font-urdu" : ""}`}
          >
            {formatToday(language)}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl justify-center px-4 py-5">
        <Link href="/" aria-label="The Post Digital home" className="block w-fit">
          <SiteLogo className="h-12 w-[min(70vw,20rem)] sm:h-14 sm:w-[24rem]" priority />
        </Link>
      </div>

      {recentArticles.length > 0 && (
        <div className="border-y border-rule bg-chrome text-inverse">
          <div className="mx-auto flex max-w-7xl items-center overflow-hidden px-4 text-xs sm:text-sm">
            <p className="shrink-0 border-x border-rule px-3 py-2 font-black uppercase tracking-[0.16em]">
              {language === "ur" ? "تازہ خبریں" : "Latest news"}
            </p>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div
                className={`recent-news-marquee flex w-max gap-8 py-2 font-bold ${
                  language === "ur" ? "recent-news-marquee--reverse" : ""
                }`}
              >
                {[...recentArticles, ...recentArticles].map((article, index) => (
                  <Link
                    href={`/article/${encodeURIComponent(article.slug)}`}
                    key={`${article.slug}-${index}`}
                    className="shrink-0"
                    aria-hidden={index >= recentArticles.length}
                    tabIndex={index >= recentArticles.length ? -1 : undefined}
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Primary" className="border-b border-soft-rule bg-elevated">
        <div
          dir={language === "ur" ? "rtl" : "ltr"}
          className={`scrollbar-none mx-auto flex max-w-7xl items-center justify-center gap-4 overflow-x-auto px-4 py-3 text-sm font-bold text-ink ${language === "ur" ? "font-urdu" : ""}`}
        >
          <Link
            href={language === "en" ? "/?language=en" : "/"}
            className="shrink-0 hover:text-accent"
          >
            {copy.home}
          </Link>
          <Link
            href={language === "en" ? "/search?language=en" : "/search"}
            className="shrink-0 hover:text-accent"
          >
            {copy.search}
          </Link>
          {categories.map((category) => (
            <Link
              href={`/search?category=${category.slug}${language === "en" ? "&language=en" : ""}`}
              key={category.slug}
              className="shrink-0 hover:text-accent"
            >
              {language === "ur"
                ? category.nameUr
                : category.name === "Technology"
                  ? "Tech"
                  : category.name}
            </Link>
          ))}
          <Link
            href={language === "en" ? "/about?language=en" : "/about"}
            className="shrink-0 hover:text-accent"
          >
            {copy.about}
          </Link>
          <Link
            href={language === "en" ? "/contact?language=en" : "/contact"}
            className="shrink-0 hover:text-accent"
          >
            {copy.contact}
          </Link>
        </div>
      </nav>
    </header>
  );
}

import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { categories } from "@/lib/categories";
import { getPublishedArticles } from "@/lib/data";
import type { Language } from "@/lib/types";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";

const labels: Record<Language, { home: string; search: string; about: string }> = {
  en: { home: "Home", search: "Search", about: "About" },
  ur: { home: "صفحہ اول", search: "تلاش", about: "ہمارے بارے میں" },
};

export async function Header({ language = "en" }: { language?: Language }) {
  const adminSession = await getAdminSession();
  const articles = await getPublishedArticles();
  const recentArticles = [...articles]
    .filter((article) => article.language === language)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .slice(0, 2);
  const copy = labels[language];

  return (
    <header className="bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div aria-hidden="true" />
          <Link href="/" aria-label="The Post Digital home" className="block w-fit">
            <SiteLogo className="h-12 w-[min(70vw,20rem)] sm:h-14 sm:w-[24rem]" priority />
          </Link>
          <div className="flex items-center justify-end gap-2">
            {adminSession && (
              <Link
                href="/admin"
                className="border border-soft-rule px-2 py-1 text-[10px] font-black text-muted hover:border-rule hover:text-ink"
              >
                Admin
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {recentArticles.length > 0 && (
        <div className="border-y border-rule bg-chrome text-inverse">
          <div className="mx-auto flex max-w-7xl items-center overflow-hidden px-4 text-xs sm:text-sm">
            <p className="shrink-0 border-x border-rule px-3 py-2 font-black uppercase tracking-[0.16em]">
              Latest
            </p>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="recent-news-marquee flex w-max gap-8 py-2 font-bold">
                {[...recentArticles, ...recentArticles].map((article, index) => (
                  <Link
                    href={`/article/${encodeURIComponent(article.slug)}`}
                    key={`${article.slug}-${index}`}
                    className="shrink-0 hover:underline"
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
          className={`scrollbar-none mx-auto flex max-w-7xl items-center justify-start gap-4 overflow-x-auto px-4 py-3 text-sm font-bold text-ink md:justify-center ${language === "ur" ? "font-urdu" : ""}`}
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
        </div>
      </nav>
    </header>
  );
}

import type { Article, Language } from "./types";

export function directionFor(language: Language) {
  return language === "ur" ? "rtl" : "ltr";
}

export function languageName(language: Language) {
  return language === "ur" ? "Urdu" : "English";
}

export function articleTextClass(article: Pick<Article, "language">) {
  return article.language === "ur" ? "font-urdu text-right" : "text-left";
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

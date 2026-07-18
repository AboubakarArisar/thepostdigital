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

// Wrap in an LTR isolate (U+2066 … U+2069) so an English date keeps its
// "17 Jul 2026" order inside an RTL/Urdu block instead of scrambling to
// "Jul 2026 17". Covers every caller in one place.
function ltrIsolate(text: string) {
  return `⁦${text}⁩`;
}

// Rendered on the server (UTC on Vercel), so pin the timezone to Pakistan —
// otherwise a story posted just after midnight PKT shows the previous day.
// en-GB gives a stable "13 Jul 2026" ordering across ICU builds.
export function formatDate(value: string) {
  return ltrIsolate(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Karachi",
    }).format(new Date(value)),
  );
}

// Same instant with the Pakistan-time clock, e.g. "13 Jul 2026, 1:10 am".
export function formatDateTime(value: string) {
  return ltrIsolate(
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Karachi",
    }).format(new Date(value)),
  );
}

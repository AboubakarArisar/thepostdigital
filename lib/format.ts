import type { Article, Language } from "./types";

// Today's date in the reader's language, e.g. "Friday, 18 July 2026" (en) or
// "جمعہ، 18 جولائی، 2026" (ur). Latin digits so both languages match the
// site's numeric style. Pinned to Pakistan time.
export function formatToday(language: Language) {
  return new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
    timeZone: "Asia/Karachi",
  }).format(new Date());
}

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
// en-GB gives a stable "13 Jul 2026" ordering across ICU builds; ur-PK gives
// "26 جولائی، 2026" — Urdu month name, Latin digits, matching the site's
// numeric style. An Urdu date is already RTL, so it must NOT be LTR-isolated.
function localeDate(value: string, language: Language, extra: Intl.DateTimeFormatOptions) {
  const text = new Intl.DateTimeFormat(language === "ur" ? "ur-PK" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    numberingSystem: "latn",
    timeZone: "Asia/Karachi",
    ...extra,
  }).format(new Date(value));

  return language === "ur" ? text : ltrIsolate(text);
}

// Admin screens are English-only, so the language defaults to "en" there.
export function formatDate(value: string, language: Language = "en") {
  return localeDate(value, language, {});
}

// Same instant with the Pakistan-time clock, e.g. "13 Jul 2026, 1:10 am".
// The clock is always LTR ("4:03 PM"), so in Urdu it is formatted separately
// and isolated — folding it into the RTL date string pushes "PM" to the far
// left and reads as "PM 4:03 ،2026 جولائی 26".
export function formatDateTime(value: string, language: Language = "en") {
  if (language !== "ur") {
    return localeDate(value, language, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(new Date(value));

  return `${localeDate(value, "ur", {})} ${ltrIsolate(time)}`;
}

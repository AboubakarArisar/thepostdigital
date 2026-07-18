import Link from "next/link";
import type { Language } from "@/lib/types";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  // Builds the href for a given page number, preserving the caller's filters.
  createHref: (page: number) => string;
  language?: Language;
};

// Windowed list of pages to render: always first + last + the current page and
// its neighbours, with "gap" markers standing in for the skipped ranges.
function pageWindow(current: number, total: number): Array<number | "gap"> {
  const shown = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...shown]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const out: Array<number | "gap"> = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) out.push("gap");
    out.push(page);
    previous = page;
  }
  return out;
}

// One joined pill: cells share borders (divide-x), the container clips them to
// a rounded shape. Same markup for EN and UR — dir="rtl" just mirrors it.
const cell =
  "flex h-10 min-w-10 items-center justify-center px-2 text-sm font-bold transition-colors";
const cellLink = "text-ink hover:bg-elevated";
const cellActive = "bg-accent text-white";
const cellDisabled = "pointer-events-none text-muted opacity-40";
const cellGap = "text-muted";

export function Pagination({
  currentPage,
  totalPages,
  createHref,
  language = "en",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isUrdu = language === "ur";
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const items = pageWindow(currentPage, totalPages);

  const prevChevron = isUrdu ? "›" : "‹";
  const nextChevron = isUrdu ? "‹" : "›";

  return (
    <nav
      aria-label="Pagination"
      dir={isUrdu ? "rtl" : "ltr"}
      className="mt-12 flex justify-center border-t border-soft-rule pt-8"
    >
      <div className="inline-flex divide-x divide-soft-rule overflow-hidden rounded-full border border-soft-rule bg-paper shadow-sm">
        {hasPrev ? (
          <Link
            href={createHref(currentPage - 1)}
            rel="prev"
            aria-label={isUrdu ? "پچھلا" : "Previous page"}
            className={`${cell} ${cellLink} text-base`}
          >
            {prevChevron}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={`${cell} ${cellDisabled} text-base`}
          >
            {prevChevron}
          </span>
        )}

        {items.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className={`${cell} ${cellGap}`} aria-hidden="true">
              …
            </span>
          ) : item === currentPage ? (
            <span key={item} aria-current="page" className={`${cell} ${cellActive}`}>
              {item}
            </span>
          ) : (
            <Link key={item} href={createHref(item)} className={`${cell} ${cellLink}`}>
              {item}
            </Link>
          ),
        )}

        {hasNext ? (
          <Link
            href={createHref(currentPage + 1)}
            rel="next"
            aria-label={isUrdu ? "اگلا" : "Next page"}
            className={`${cell} ${cellLink} text-base`}
          >
            {nextChevron}
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={`${cell} ${cellDisabled} text-base`}
          >
            {nextChevron}
          </span>
        )}
      </div>
    </nav>
  );
}

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

const edgeButton =
  "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors";
const edgeEnabled = "text-muted hover:bg-elevated hover:text-ink";
const edgeDisabled = "pointer-events-none text-muted opacity-40";

const numberChip =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors";
const numberInactive = "text-muted hover:bg-elevated hover:text-ink";
const numberActive = "bg-accent text-white shadow-sm";

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

  const prevArrow = isUrdu ? "→" : "←";
  const nextArrow = isUrdu ? "←" : "→";

  return (
    <nav
      aria-label="Pagination"
      dir={isUrdu ? "rtl" : "ltr"}
      className={`mt-12 flex flex-wrap items-center justify-center gap-1.5 border-t border-soft-rule pt-8 ${
        isUrdu ? "font-urdu" : ""
      }`}
    >
      {hasPrev ? (
        <Link
          href={createHref(currentPage - 1)}
          rel="prev"
          className={`${edgeButton} ${edgeEnabled}`}
        >
          <span aria-hidden="true">{prevArrow}</span>
          <span className="hidden sm:inline">{isUrdu ? "پچھلا" : "Prev"}</span>
        </Link>
      ) : (
        <span className={`${edgeButton} ${edgeDisabled}`} aria-disabled="true">
          <span aria-hidden="true">{prevArrow}</span>
          <span className="hidden sm:inline">{isUrdu ? "پچھلا" : "Prev"}</span>
        </span>
      )}

      {/* Numbered pages — tablet/desktop. */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {items.map((item, index) =>
          item === "gap" ? (
            <span
              key={`gap-${index}`}
              className="inline-flex h-10 w-6 items-center justify-center text-muted"
              aria-hidden="true"
            >
              …
            </span>
          ) : item === currentPage ? (
            <span
              key={item}
              aria-current="page"
              className={`${numberChip} ${numberActive}`}
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={createHref(item)}
              className={`${numberChip} ${numberInactive}`}
            >
              {item}
            </Link>
          ),
        )}
      </div>

      {/* Compact indicator — mobile. */}
      <span className="px-3 text-sm font-bold text-muted sm:hidden">
        {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={createHref(currentPage + 1)}
          rel="next"
          className={`${edgeButton} ${edgeEnabled}`}
        >
          <span className="hidden sm:inline">{isUrdu ? "اگلا" : "Next"}</span>
          <span aria-hidden="true">{nextArrow}</span>
        </Link>
      ) : (
        <span className={`${edgeButton} ${edgeDisabled}`} aria-disabled="true">
          <span className="hidden sm:inline">{isUrdu ? "اگلا" : "Next"}</span>
          <span aria-hidden="true">{nextArrow}</span>
        </span>
      )}
    </nav>
  );
}

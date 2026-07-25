import Link from "next/link";
import type { Article, Language } from "@/lib/types";

const leadLanguages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
];

// The homepage lead is per language, so the two are shown side by side. Without
// this the only clue is a ★ hidden somewhere in a paginated list of 100+ rows.
export function LeadStories({ articles }: { articles: Article[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {leadLanguages.map(({ code, label }) => {
        const lead = articles.find(
          (article) => article.language === code && (article.priority ?? 0) >= 2,
        );

        return (
          <div
            key={code}
            className="border-2 border-wheat-900 bg-elevated p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                <span className={code === "ur" ? "font-urdu" : ""}>{label}</span>{" "}
                top story
              </p>
              <span
                className={lead ? "text-accent" : "text-muted"}
                aria-hidden="true"
              >
                ★
              </span>
            </div>

            {lead ? (
              <>
                <p
                  dir={code === "ur" ? "rtl" : "ltr"}
                  className={`mt-2 font-bold leading-6 ${code === "ur" ? "font-urdu text-right" : ""}`}
                >
                  {lead.title}
                </p>
                <Link
                  href={`/admin/editor?slug=${encodeURIComponent(lead.slug)}`}
                  className="mt-3 inline-block text-xs font-black uppercase tracking-[0.12em] underline"
                >
                  Edit this story
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted">
                No top story set. Filter the table below to {label} and press
                “Feature” on the story you want as the big headline.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

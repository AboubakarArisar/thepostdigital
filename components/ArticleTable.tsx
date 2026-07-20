"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { formatDate, languageName } from "@/lib/format";
import type { AdminRole, Article, Language } from "@/lib/types";

const ARTICLES_PER_PAGE = 10;

const statusClass = {
  draft: "bg-white text-black",
  pending_approval: "bg-accent-soft text-black",
  published: "bg-black text-yellow-400",
  scheduled: "bg-zinc-200 text-black",
  archived: "bg-zinc-700 text-yellow-400",
};

// Single-path stroke icons, inlined rather than pulling in an icon package for
// seven glyphs.
const iconPaths = {
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
  send: "m22 2-7 20-4-9-9-4Z",
  check: "M20 6 9 17l-5-5",
  hide: "M9.9 4.24A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a18 18 0 0 1-2.16 3.19M6.61 6.61A18 18 0 0 0 2 11s3.6 7 10 7a9 9 0 0 0 5.39-1.61M2 2l20 20",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z",
  archive: "M21 8v13H3V8M1 3h22v5H1zM10 12h4",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6",
};

type IconName = keyof typeof iconPaths;

function ActionIcon({ name, filled }: { name: IconName; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const actionBase =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40";

// Icon-only controls still need a name for screen readers and for anyone who
// cannot guess the glyph, so every one carries a title and an aria-label.
function ActionButton({
  label,
  name,
  onClick,
  disabled,
  filled,
  tone = "default",
}: {
  label: string;
  name: IconName;
  onClick: () => void;
  disabled?: boolean;
  filled?: boolean;
  tone?: "default" | "danger";
}) {
  const skin = filled
    ? "border-accent bg-accent text-white"
    : tone === "danger"
      ? "border-wheat-900 hover:border-red-600 hover:bg-red-600 hover:text-white"
      : "border-wheat-900 hover:border-accent hover:bg-accent hover:text-white";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${actionBase} ${skin}`}
    >
      <ActionIcon name={name} filled={filled} />
    </button>
  );
}

function articleApiRoute(slug: string) {
  return `/api/articles/${encodeURIComponent(slug)}`;
}

function articleCollectionApiRoute(slug: string) {
  return `/api/articles?slug=${encodeURIComponent(slug)}`;
}

export function ArticleTable({
  articles,
  currentRole,
  title = "Recent editorial",
}: {
  articles: Article[];
  currentRole: AdminRole;
  title?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Article[]>(articles);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [featuringSlug, setFeaturingSlug] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<"all" | Language>("all");
  const isSuper = currentRole === "super_admin";

  // Re-sync when the server sends a fresh list (e.g. after router.refresh()).
  useEffect(() => {
    setItems(articles);
  }, [articles]);

  const visible =
    languageFilter === "all"
      ? items
      : items.filter((item) => item.language === languageFilter);
  const totalPages = Math.max(1, Math.ceil(visible.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageArticles = visible.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  async function confirmDelete() {
    if (!pendingDelete) return;
    const slug = pendingDelete.slug;
    setDeleting(true);

    try {
      const response = await fetch(articleCollectionApiRoute(slug), {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove locally so the table updates without a refresh.
        setItems((current) => current.filter((item) => item.slug !== slug));
        setPendingDelete(null);
        toast.success("Story deleted.");
      } else if (response.status === 404) {
        // Someone else deleted it while this page was open, so the row is a
        // ghost from stale HTML. Drop it instead of showing a confusing error.
        setItems((current) => current.filter((item) => item.slug !== slug));
        setPendingDelete(null);
        toast("This story was already removed by someone else.");
        router.refresh();
      } else {
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        toast.error(result.error || "Could not delete this story.");
      }
    } catch {
      toast.error("Could not delete this story. Check your connection.");
    } finally {
      setDeleting(false);
    }
  }

  async function changeStatus(article: Article) {
    const nextStatus = article.status === "published" ? "draft" : "published";

    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: nextStatus }),
    });

    if (response.ok) {
      toast.success(
        nextStatus === "published" ? "Story published." : "Moved to draft.",
      );
      router.refresh();
    } else {
      toast.error("Could not update this story.");
    }
  }

  async function submitForApproval(article: Article) {
    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: "pending_approval" }),
    });

    if (response.ok) {
      toast.success("Submitted for approval.");
      router.refresh();
    } else {
      toast.error("Could not submit this story.");
    }
  }

  // Set (or clear) the homepage "Top story" straight from the list. Lead is
  // per-language, so featuring one demotes any other top in the same language.
  async function toggleFeatured(article: Article) {
    if (featuringSlug) return;
    setFeaturingSlug(article.slug);
    const makeTop = (article.priority ?? 0) < 2;

    try {
      // The server demotes any other top in this language (enforceSingleTop).
      const response = await fetch(articleApiRoute(article.slug), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...article, priority: makeTop ? 2 : 0 }),
      });

      if (!response.ok) {
        toast.error("Could not update the top story.");
        return;
      }

      // Mirror the server's single-top rule locally for an instant ★ move.
      setItems((current) =>
        current.map((item) => {
          if (item.slug === article.slug)
            return { ...item, priority: makeTop ? 2 : 0 };
          if (
            makeTop &&
            item.language === article.language &&
            (item.priority ?? 0) >= 2
          )
            return { ...item, priority: 0 };
          return item;
        }),
      );
      toast.success(makeTop ? "Set as the top story." : "Removed from top story.");
      router.refresh();
    } catch {
      toast.error("Could not update the top story.");
    } finally {
      setFeaturingSlug(null);
    }
  }

  async function archiveStory(article: Article) {
    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: "archived" }),
    });

    if (response.ok) {
      // Archived stories leave the live table immediately.
      setItems((current) =>
        current.filter((item) => item.slug !== article.slug),
      );
      toast.success("Story archived.");
      router.refresh();
    } else {
      toast.error("Could not archive this story.");
    }
  }

  return (
    <div className="border-2 border-wheat-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-wheat-900 bg-elevated px-3 py-2">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-ink">
          {title}
        </p>
        {/* The lead story is per language, so filtering by language is the
            fastest way to find the story you want to feature. */}
        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.12em]">
          {([
            ["all", `All (${items.length})`],
            ["en", `English (${items.filter((i) => i.language === "en").length})`],
            ["ur", `اردو (${items.filter((i) => i.language === "ur").length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setLanguageFilter(value);
                setPage(1);
              }}
              className={`cursor-pointer rounded-md border px-2 py-1 transition-colors ${
                languageFilter === value
                  ? "border-accent bg-accent text-white"
                  : "border-wheat-900 hover:bg-black hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-wheat-900 text-xs uppercase tracking-[0.14em]">
            <th className="p-3">Title</th>
            <th className="p-3">Category</th>
            <th className="p-3">Type</th>
            <th className="p-3">Media</th>
            <th className="p-3">Language</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wheat-900">
          {visible.length === 0 ? (
            <tr>
              <td className="p-6 text-center font-bold text-zinc-600" colSpan={8}>
                {languageFilter === "all"
                  ? "No stories found here."
                  : "No stories in this language yet."}
              </td>
            </tr>
          ) : (
            pageArticles.map((article) => (
            <tr key={article.slug}>
              <td className="max-w-xs p-3 font-bold">
                {(article.priority ?? 0) >= 2 && (
                  <span
                    className="mr-1 text-accent"
                    title="Top story on the homepage"
                  >
                    ★
                  </span>
                )}
                {article.title}
              </td>
              <td className="p-3">{article.category}</td>
              <td className="p-3 capitalize">{article.contentType}</td>
              <td className="p-3 capitalize">{article.mediaType}</td>
              <td className="p-3">{languageName(article.language)}</td>
              <td className="p-3">
                <span
                  className={`border border-wheat-900 px-2 py-1 text-white text-xs font-black uppercase tracking-[0.12em] ${statusClass[article.status]}`}
                >
                  {article.status}
                </span>
              </td>
              <td className="p-3">
                {formatDate(article.publishedAt)}
                {article.status === "scheduled" && (
                  <span className="mt-0.5 block text-xs font-black uppercase tracking-[0.1em] text-muted">
                    goes live
                  </span>
                )}
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/editor?slug=${encodeURIComponent(article.slug)}`}
                    title="Edit story"
                    aria-label="Edit story"
                    className={`${actionBase} border-wheat-900 hover:border-accent hover:bg-accent hover:text-white`}
                  >
                    <ActionIcon name="edit" />
                  </Link>

                  {isSuper ? (
                    <ActionButton
                      label={
                        article.status === "published"
                          ? "Move back to draft"
                          : "Publish now"
                      }
                      name={article.status === "published" ? "hide" : "check"}
                      onClick={() => changeStatus(article)}
                    />
                  ) : (
                    // Only a draft has anything to submit — showing it on an
                    // already published or pending story was just noise.
                    article.status === "draft" && (
                      <ActionButton
                        label="Submit for approval"
                        name="send"
                        onClick={() => submitForApproval(article)}
                      />
                    )
                  )}

                  {/* The homepage lead and archiving are newsroom-wide calls,
                      so they stay with the super admin. */}
                  {isSuper && (
                    <>
                      <ActionButton
                        label={
                          (article.priority ?? 0) >= 2
                            ? "Remove as top story"
                            : "Make top story"
                        }
                        name="star"
                        filled={(article.priority ?? 0) >= 2}
                        disabled={featuringSlug !== null}
                        onClick={() => toggleFeatured(article)}
                      />
                      {article.status !== "archived" && (
                        <ActionButton
                          label="Archive story"
                          name="archive"
                          onClick={() => archiveStory(article)}
                        />
                      )}
                    </>
                  )}

                  {/* Deleting your own story is your call. The API still checks
                      ownership, so this can only ever hit your own work. */}
                  <ActionButton
                    label="Delete story"
                    name="trash"
                    tone="danger"
                    onClick={() => setPendingDelete(article)}
                  />
                </div>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-wheat-900  px-3 py-3">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-2 cursor-pointer border-wheat-900 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-black hover:text-yellow-400 disabled:pointer-events-none transition-0.2s disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs font-black uppercase tracking-[0.12em]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-2 cursor-pointer border-wheat-900 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-black hover:text-yellow-400 disabled:pointer-events-none transition-0.2s disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete story"
        message={
          pendingDelete
            ? `Delete "${pendingDelete.title}" permanently from the newsroom? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}

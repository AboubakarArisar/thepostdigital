"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, languageName } from "@/lib/format";
import type { AdminRole, Article } from "@/lib/types";

const ARTICLES_PER_PAGE = 10;

const statusClass = {
  draft: "bg-white text-black",
  pending_approval: "bg-accent-soft text-black",
  published: "bg-black text-yellow-400",
  scheduled: "bg-zinc-200 text-black",
  archived: "bg-zinc-700 text-yellow-400",
};

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
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageArticles = articles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  async function deleteStory(slug: string) {
    const confirmed = window.confirm(
      "Delete this story permanently from the newsroom?",
    );
    if (!confirmed) return;

    const response = await fetch(articleCollectionApiRoute(slug), {
      method: "DELETE",
    });
    if (response.ok) {
      router.refresh();
    }
  }

  async function changeStatus(article: Article) {
    const nextStatus = article.status === "published" ? "draft" : "published";
    const confirmed = window.confirm(
      `${nextStatus === "published" ? "Publish" : "Move to draft"} "${article.title}"?`,
    );
    if (!confirmed) return;

    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: nextStatus }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function submitForApproval(article: Article) {
    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: "pending_approval" }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function archiveStory(article: Article) {
    const confirmed = window.confirm(
      `Archive "${article.title}"? It will only appear in the archive.`,
    );
    if (!confirmed) return;

    const response = await fetch(articleApiRoute(article.slug), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: "archived" }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="border-2 border-black">
      <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <caption className="border-b-2 border-black bg-black px-3 py-2 text-left text-sm font-black uppercase tracking-[0.16em] text-yellow-400">
          {title}
        </caption>
        <thead>
          <tr className="border-b-2 border-black text-xs uppercase tracking-[0.14em]">
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
        <tbody className="divide-y divide-black">
          {articles.length === 0 ? (
            <tr>
              <td className="p-6 text-center font-bold text-zinc-600" colSpan={8}>
                No stories found here.
              </td>
            </tr>
          ) : (
            pageArticles.map((article) => (
            <tr key={article.slug}>
              <td className="max-w-xs p-3 font-bold">{article.title}</td>
              <td className="p-3">{article.category}</td>
              <td className="p-3 capitalize">{article.contentType}</td>
              <td className="p-3 capitalize">{article.mediaType}</td>
              <td className="p-3">{languageName(article.language)}</td>
              <td className="p-3">
                <span
                  className={`border border-black px-2 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusClass[article.status]}`}
                >
                  {article.status}
                </span>
              </td>
              <td className="p-3">{formatDate(article.publishedAt)}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="cursor-pointer font-bold underline"
                    href={`/admin/editor?slug=${encodeURIComponent(article.slug)}`}
                  >
                    Edit
                  </Link>
                  <button
                    className="cursor-pointer font-bold underline"
                    type="button"
                    onClick={() =>
                      currentRole === "super_admin"
                        ? changeStatus(article)
                        : submitForApproval(article)
                    }
                  >
                    {currentRole === "super_admin"
                      ? article.status === "published"
                        ? "Draft"
                        : "Approve"
                      : "Submit"}
                  </button>
                  {article.status !== "archived" && (
                    <button
                      className="cursor-pointer font-bold underline"
                      type="button"
                      onClick={() => archiveStory(article)}
                    >
                      Archive
                    </button>
                  )}
                  <button
                    className="cursor-pointer font-bold underline"
                    type="button"
                    onClick={() => deleteStory(article.slug)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-black  px-3 py-3">
          <button
            type="button"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-2 cursor-pointer border-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-black hover:text-yellow-400 disabled:pointer-events-none transition-0.2s disabled:opacity-40"
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
            className="border-2 cursor-pointer border-black px-4 py-2 text-xs font-black uppercase tracking-[0.12em] hover:bg-black hover:text-yellow-400 disabled:pointer-events-none transition-0.2s disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate, languageName } from "@/lib/format";
import type { AdminRole, Article } from "@/lib/types";

const statusClass = {
  draft: "bg-white text-black",
  pending_approval: "bg-accent-soft text-black",
  published: "bg-black text-white",
  scheduled: "bg-zinc-200 text-black",
};

export function ArticleTable({
  articles,
  currentRole,
}: {
  articles: Article[];
  currentRole: AdminRole;
}) {
  const router = useRouter();

  async function deleteStory(slug: string) {
    const confirmed = window.confirm(
      "Delete this story permanently from the newsroom?",
    );
    if (!confirmed) return;

    const response = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
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

    const response = await fetch(`/api/articles/${article.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: nextStatus }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  async function submitForApproval(article: Article) {
    const response = await fetch(`/api/articles/${article.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...article, status: "pending_approval" }),
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="overflow-x-auto border-2 border-black">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <caption className="border-b-2 border-black bg-black px-3 py-2 text-left text-sm font-black uppercase tracking-[0.16em] text-white">
          Recent editorial
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
                No stories yet. Create a news, editorial, photo, or video story
                from the editor.
              </td>
            </tr>
          ) : (
            articles.map((article) => (
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
                  <Link
                    className="cursor-pointer font-bold underline"
                    href={`/article/${article.slug}`}
                  >
                    View
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
  );
}

import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { ArticleTable } from "@/components/ArticleTable";
import { StatsCard } from "@/components/StatsCard";
import { getAdminSession, getAdminUsers, isSuperAdmin } from "@/lib/auth";
import { getArticles, getPublishedArticles } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const articles = await getArticles();
  const published = await getPublishedArticles();
  const drafts = articles.filter((article) => article.status === "draft").length;
  const pendingApproval = articles.filter(
    (article) => article.status === "pending_approval",
  ).length;
  const mediaStories = articles.filter(
    (article) => article.mediaType === "image" || article.mediaType === "video",
  ).length;
  const adminUsers = isSuperAdmin(session) ? await getAdminUsers() : [];

  return (
    <main className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <section className="p-4 md:p-6">
        <div className="border-b-4 border-black pb-4">
          <p className="text-xs font-black uppercase tracking-[0.16em]">
            Newsroom
          </p>
          <h1 className="font-serif-display mt-2 text-5xl font-black leading-none">
            Dashboard
          </h1>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatsCard
            label="Published"
            value={String(published.length)}
            detail="Live stories in the public archive"
          />
          <StatsCard
            label="Drafts"
            value={String(drafts)}
            detail="Stories waiting for editorial review"
          />
          <StatsCard
            label="Pending"
            value={String(pendingApproval)}
            detail="Submitted stories waiting for super admin approval"
          />
          <StatsCard
            label="Media"
            value={String(mediaStories)}
            detail="Image and video stories ready for Cloudinary assets"
          />
        </div>
        <div className="mt-6">
          <ArticleTable articles={articles} currentRole={session.role} />
        </div>
        {isSuperAdmin(session) && (
          <div className="mt-6">
            <AdminUsersTable users={adminUsers} />
          </div>
        )}
      </section>
    </main>
  );
}

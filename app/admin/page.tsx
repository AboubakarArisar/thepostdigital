import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { ArticleTable } from "@/components/ArticleTable";
import { AudiencePanel } from "@/components/AudiencePanel";
import { StatsCard } from "@/components/StatsCard";
import { getAnalytics } from "@/lib/analytics";
import { getAdminSession, getAdminUsers, isSuperAdmin } from "@/lib/auth";
import { getArticles } from "@/lib/data";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const articles = await getArticles();
  const liveArticles = articles.filter((article) => article.status !== "archived");
  const archivedArticles = articles.filter((article) => article.status === "archived");
  const published = liveArticles.filter((article) => article.status === "published");
  const drafts = liveArticles.filter((article) => article.status === "draft").length;
  const pendingApproval = liveArticles.filter(
    (article) => article.status === "pending_approval",
  ).length;
  const mediaStories = liveArticles.filter(
    (article) => article.mediaType === "image" || article.mediaType === "video",
  ).length;
  const adminUsers = isSuperAdmin(session) ? await getAdminUsers() : [];
  const pendingAdminUsers = adminUsers.filter((user) => user.status === "pending").length;
  const analytics = await getAnalytics();

  return (
    <main className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <section className="p-4 md:p-6">
        <div className="border-b-4 border-wheat-900 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                Newsroom
              </p>
              <h1 className="font-serif-display mt-2 text-5xl font-black leading-none">
                Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Review stories, publish approved work, and manage access requests from one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/editor"
                className="border-2 border-wheat-900 rounded-xl transition-2s bg-black px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white hover:bg-white hover:text-black"
              >
                New story
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatsCard
            label="Published"
            value={String(published.length)}
            detail="Live stories visible on the public site"
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
          {isSuperAdmin(session) && (
            <StatsCard
              label="Access"
              value={String(pendingAdminUsers)}
              detail="Admin access requests waiting for review"
            />
          )}
          <StatsCard
            label="Archived"
            value={String(archivedArticles.length)}
            detail="Hidden stories kept in the admin archive"
          />
        </div>
        <div className="mt-6">
          <AudiencePanel analytics={analytics} />
        </div>
        <div className="mt-6">
          <ArticleTable
            articles={liveArticles}
            currentRole={session.role}
            title="Recent editorial"
          />
        </div>
        {isSuperAdmin(session) && (
          <div className="mt-6 scroll-mt-6" id="access-requests">
            <AdminUsersTable users={adminUsers} />
          </div>
        )}
      </section>
    </main>
  );
}

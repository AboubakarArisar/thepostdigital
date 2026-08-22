import { AdminSidebar } from "@/components/AdminSidebar";
import { ArticleTable } from "@/components/ArticleTable";
import { StatsCard } from "@/components/StatsCard";
import { getAdminSession } from "@/lib/auth";
import { articlesFor, getCards } from "@/lib/data";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Only archived stories, as body-stripped cards.
  const archivedArticles = articlesFor(
    await getCards(
      session.role === "super_admin"
        ? { status: "archived" }
        : { status: "archived", createdBy: session.email },
    ),
    session,
  );

  return (
    <main className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <section className="p-4 md:p-6">
        <div className="border-b-4 border-wheat-900 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.16em]">
            Newsroom
          </p>
          <h1 className="font-serif-display mt-2 text-5xl font-black leading-none">
            Archive
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-700">
            Archived stories are hidden from the public site and kept here for admins.
          </p>
        </div>

        <div className="mt-6 max-w-xs">
          <StatsCard
            label="Archived"
            value={String(archivedArticles.length)}
            detail="Hidden stories kept in the admin archive"
          />
        </div>

        <div className="mt-6">
          <ArticleTable
            articles={archivedArticles}
            currentRole={session.role}
            title="Archived editorial"
          />
        </div>
      </section>
    </main>
  );
}

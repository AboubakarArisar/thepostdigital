import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { ArticleTable } from "@/components/ArticleTable";
import { AudiencePanel } from "@/components/AudiencePanel";
import { LeadStories } from "@/components/LeadStories";
import { StatsCard } from "@/components/StatsCard";
import { getAnalytics } from "@/lib/analytics";
import { getAdminSession, getAdminUsers, isSuperAdmin } from "@/lib/auth";
import { articlesFor, getCards, isLive } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const views = {
  pending: {
    title: "Pending approval",
    match: (article: Article) => article.status === "pending_approval",
  },
  scheduled: {
    title: "Scheduled stories",
    match: (article: Article) => article.status === "scheduled",
  },
  drafts: {
    title: "Drafts",
    match: (article: Article) => article.status === "draft",
  },
  live: {
    title: "Live on the site",
    match: (article: Article) => isLive(article),
  },
} as const;

type ViewKey = keyof typeof views;

function isViewKey(value: string | undefined): value is ViewKey {
  return value !== undefined && value in views;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const rawView = (await searchParams).view;
  const viewParam = Array.isArray(rawView) ? rawView[0] : rawView;
  const view = isViewKey(viewParam) ? viewParam : null;

  const isSuper = isSuperAdmin(session);
  // All stories as body-stripped cards (getCards relabels due-scheduled to
  // published, so the badge is correct). The dashboard table never shows body.
  const articles = articlesFor(
    await getCards(isSuper ? {} : { createdBy: session.email }),
    session,
  );
  const liveArticles = articles.filter((article) => article.status !== "archived");
  const archivedArticles = articles.filter((article) => article.status === "archived");
  // "Live" counts scheduled stories whose time has arrived, matching what the
  // public site actually shows.
  const published = liveArticles.filter((article) => isLive(article));
  const drafts = liveArticles.filter((article) => article.status === "draft").length;
  const pendingApproval = liveArticles.filter(
    (article) => article.status === "pending_approval",
  ).length;
  // Scheduled but not yet live — once the time passes, getArticles() has
  // already promoted it to "published".
  const upcoming = liveArticles
    .filter((article) => article.status === "scheduled" && !isLive(article))
    .sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt));
  const [adminUsers, analytics] = isSuper
    ? await Promise.all([getAdminUsers(), getAnalytics()])
    : [[], null];
  const pendingAdminUsers = adminUsers.filter((user) => user.status === "pending").length;

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
                {isSuper ? "Dashboard" : "My stories"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                {isSuper
                  ? "Review stories, publish approved work, and manage access requests from one place."
                  : "Write and edit your own stories. Submitted work goes to the super admin for approval before it appears on the site."}
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
        {/* Only the counts that need a decision get a card. Everything else is
            a one-line summary below, so the cards stay scannable. */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <StatsCard
            label="Published"
            value={String(published.length)}
            detail="Stories visible on the public site right now"
            href="/admin?view=live#stories"
            active={view === "live"}
          />
          <StatsCard
            label="Pending"
            value={String(pendingApproval)}
            detail={
              isSuper
                ? "Submitted stories waiting for your approval"
                : "Your submitted stories waiting for approval"
            }
            href="/admin?view=pending#stories"
            active={view === "pending"}
          />
          <StatsCard
            label="Scheduled"
            value={String(upcoming.length)}
            detail="Stories queued to publish themselves later"
            href="/admin?view=scheduled#stories"
            active={view === "scheduled"}
          />
          <StatsCard
            label="Drafts"
            value={String(drafts)}
            detail="Stories waiting for editorial review"
            href="/admin?view=drafts#stories"
            active={view === "drafts"}
          />
          {isSuper ? (
            <StatsCard
              label="Access"
              value={String(pendingAdminUsers)}
              detail="Admin access requests waiting for review"
              href="#access-requests"
            />
          ) : (
            <StatsCard
              label="Archived"
              value={String(archivedArticles.length)}
              detail="Hidden stories kept in the admin archive"
              href="/admin/archive"
            />
          )}
        </div>
        <p className="mt-3 text-sm font-bold text-muted">
          {published.length} live on the site ·{" "}
          <Link href="/admin/archive" className="underline hover:text-ink">
            {archivedArticles.length} archived
          </Link>{" "}
          · {articles.length} {isSuper ? "stories in total" : "of your stories"}
        </p>

        {/* Choosing the homepage lead is a super-admin decision, so a normal
            admin is not shown the two language leads at all. */}
        {isSuper && (
          <div className="mt-6">
            <LeadStories articles={liveArticles} />
          </div>
        )}

        {view === null && upcoming.length > 0 && (
          <div className="mt-6">
            <ArticleTable
              articles={upcoming}
              currentRole={session.role}
              title={`Scheduled — next up ${formatDate(upcoming[0].publishedAt)}`}
            />
          </div>
        )}

        {/* Site-wide traffic belongs to whoever runs the newsroom, not to an
            individual writer. */}
        {isSuper && analytics && (
          <div className="mt-6">
            <AudiencePanel analytics={analytics} />
          </div>
        )}
        <div className="mt-6 scroll-mt-6" id="stories">
          {view && (
            <p className="mb-2 text-sm font-bold text-muted">
              Showing {views[view].title.toLowerCase()} ·{" "}
              <Link href="/admin#stories" className="underline hover:text-ink">
                show all stories
              </Link>
            </p>
          )}
          <ArticleTable
            articles={view ? liveArticles.filter(views[view].match) : liveArticles}
            currentRole={session.role}
            title={
              view
                ? views[view].title
                : isSuper
                  ? "Recent editorial"
                  : "My stories"
            }
          />
        </div>
        {isSuper && (
          <div className="mt-6 scroll-mt-6" id="access-requests">
            <AdminUsersTable users={adminUsers} />
          </div>
        )}
      </section>
    </main>
  );
}

import { AdminSidebar } from "@/components/AdminSidebar";
import { NewsEditorForm } from "@/components/NewsEditorForm";
import { getAdminSession } from "@/lib/auth";
import { getArticleBySlug } from "@/lib/data";
import { notFound, redirect } from "next/navigation";

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { slug } = await searchParams;
  const article = slug ? await getArticleBySlug(slug) : undefined;
  if (slug && !article) notFound();

  return (
    <main className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <section className="p-4 md:p-6">
        <div className="mb-6 border-b-4 border-black pb-4">
          <p className="text-xs font-black uppercase tracking-[0.16em]">
            Compose
          </p>
          <h1 className="font-serif-display mt-2 text-5xl font-black leading-none">
            {article ? "Edit story" : "News editor"}
          </h1>
        </div>
        <NewsEditorForm article={article} currentRole={session.role} />
      </section>
    </main>
  );
}

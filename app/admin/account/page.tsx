import { redirect } from "next/navigation";
import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <main className="grid min-h-screen md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <section className="p-4 md:p-6">
        <div className="mb-6 border-b-4 border-wheat-900 pb-4">
          <p className="text-xs font-black uppercase tracking-[0.16em]">
            Account
          </p>
          <h1 className="font-serif-display mt-2 text-5xl font-black leading-none">
            Change password
          </h1>
          <p className="mt-2 text-sm font-bold text-muted">{session.email}</p>
        </div>
        <AdminPasswordForm />
      </section>
    </main>
  );
}

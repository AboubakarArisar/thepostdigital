import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminSignupForm } from "@/components/AdminSignupForm";
import { isAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md border-4 border-black bg-paper p-6">
        <Link href="/" className="text-xs font-black uppercase tracking-[0.16em]">
          Public edition
        </Link>
        <h1 className="font-serif-display mt-6 text-5xl font-black leading-none">
          Editorial login
        </h1>
        <p className="mt-3 border-b-2 border-black pb-4 text-sm text-zinc-700">
          Sign in to manage bilingual newsroom copy, schedules, and publication
          status.
        </p>
        <AdminLoginForm />
        <AdminSignupForm />
      </section>
    </main>
  );
}

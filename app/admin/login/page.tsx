import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminSignupForm } from "@/components/AdminSignupForm";
import { SiteLogo } from "@/components/SiteLogo";
import { isAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  if (await isAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-5xl border-4 border-wheat-900 bg-paper">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b-4 border-wheat-900 p-6 lg:border-b-0 lg:border-r-4">
            <Link href="/" aria-label="The Post Digital home" className="block w-fit">
              <SiteLogo className="h-12 w-64" priority />
            </Link>
            <h1 className="font-serif-display mt-6 text-5xl font-black leading-none">
              Editorial login
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-700">
              Sign in to manage bilingual newsroom copy, schedules, and
              publication status.
            </p>
            <AdminLoginForm />
          </div>

          <div className="bg-elevated p-6">
            <AdminSignupForm />
            <div className="mt-6 border-t-2 border-wheat-900 pt-5">
              <p className="text-xs font-black uppercase tracking-[0.16em]">
                How approval works
              </p>
              <ol className="mt-3 space-y-3 text-sm leading-6 text-zinc-700">
                <li>
                  <span className="font-black text-ink">1.</span> Submit your
                  name, email, and password.
                </li>
                <li>
                  <span className="font-black text-ink">2.</span> The super
                  admin reviews the request from the dashboard.
                </li>
                <li>
                  <span className="font-black text-ink">3.</span> Once approved,
                  use the same email and password to sign in.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

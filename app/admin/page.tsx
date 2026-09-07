import { redirect } from "next/navigation";

import {
  isAuthenticated,
  isCorrectPassword,
  startSession,
} from "@/lib/admin-auth";

/**
 * Admin entry point: login, or straight through if the session is valid.
 *
 * Note there is no user list and no roles yet — this is the interim gate
 * described in lib/admin-auth.ts, not the per-staff auth of CLAUDE.md §11.
 */
export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin">) {
  if (await isAuthenticated()) redirect("/admin/mahsulotlar");

  const { error } = await searchParams;
  const failed = error === "1";

  async function login(formData: FormData) {
    "use server";

    const password = String(formData.get("password") ?? "");
    if (!isCorrectPassword(password)) {
      // Deliberately vague: never reveal whether a password was close.
      redirect("/admin?error=1");
    }
    await startSession();
    redirect("/admin/mahsulotlar");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-bg p-8 shadow-sm">
        <h1 className="text-lg font-bold text-fg">Boshqaruv paneli</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Davom etish uchun parolni kiriting.
        </p>

        <form action={login} className="mt-6 flex flex-col gap-3">
          <label htmlFor="password" className="sr-only">
            Parol
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
          />

          {failed ? (
            <p role="alert" className="text-sm text-sale">
              Parol noto&apos;g&apos;ri.
            </p>
          ) : null}

          <button
            type="submit"
            className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-brand-ink transition hover:bg-brand-hover"
          >
            Kirish
          </button>
        </form>
      </div>
    </main>
  );
}

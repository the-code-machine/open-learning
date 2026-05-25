import { redirect } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { loginAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const notConfigured = !process.env.ADMIN_SECRET;

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border-t-4 border-brand-green p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-4">
              <Lock size={26} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter the shared admin secret to manage events, games and
              participants.
            </p>
          </div>

          {notConfigured && (
            <div className="mb-4 flex items-start gap-2 text-sm bg-amber-50 text-amber-800 rounded-lg p-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                ADMIN_SECRET is not set. Add it to your environment to enable
                login.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm bg-red-50 text-brand-red rounded-lg p-3">
              <AlertCircle size={16} /> Incorrect secret. Try again.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input
              type="password"
              name="secret"
              required
              placeholder="Admin secret"
              autoFocus
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition"
            />
            <button
              type="submit"
              disabled={notConfigured}
              className="w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

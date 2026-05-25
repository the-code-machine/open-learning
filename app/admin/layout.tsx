import Link from "next/link";
import { LayoutDashboard, LogOut, ArrowUpRight } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {admin && (
        <header className="bg-brand-blue text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <LayoutDashboard size={20} />
              <span>Admin</span>
              <span className="text-blue-200 font-normal text-sm hidden sm:inline">
                Wiki Open Learning
              </span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/events"
                className="hidden sm:flex items-center gap-1 text-blue-100 hover:text-white transition-colors"
              >
                View site <ArrowUpRight size={15} />
              </Link>
              <form action={logoutAction}>
                <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
                  <LogOut size={15} /> Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
      )}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

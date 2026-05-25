import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { createGameAction } from "@/lib/actions";
import { getRegistryComponents } from "@/lib/queries";
import GameForm from "@/components/admin/GameForm";

export const dynamic = "force-dynamic";

export default async function NewGamePage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const components = getRegistryComponents();
  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors text-sm"
      >
        <ArrowLeft size={18} className="mr-1.5" /> Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">New Game</h1>
      <GameForm action={createGameAction} components={components} />
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getGame, getRegistryComponents } from "@/lib/queries";
import { updateGameAction, deleteGameAction } from "@/lib/actions";
import GameForm from "@/components/admin/GameForm";

export const dynamic = "force-dynamic";

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const game = await getGame(id);
  if (!game) notFound();
  const components = getRegistryComponents();

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors text-sm"
      >
        <ArrowLeft size={18} className="mr-1.5" /> Dashboard
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Edit Game</h1>
        <Link
          href={`/games/${game.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green"
        >
          View public page <ExternalLink size={14} />
        </Link>
      </div>

      <GameForm
        action={updateGameAction}
        initial={game}
        components={components}
      />

      <form
        action={deleteGameAction}
        className="bg-red-50 border border-red-100 rounded-xl p-6"
      >
        <input type="hidden" name="id" value={game.id} />
        <h2 className="font-bold text-brand-red mb-2">Danger zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Deleting this game also removes its event links and all participation
          records for it. This cannot be undone.
        </p>
        <button className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors">
          <Trash2 size={16} /> Delete game
        </button>
      </form>
    </div>
  );
}

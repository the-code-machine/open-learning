import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getGame, getEvent, getParticipations } from "@/lib/queries";
import ParticipationManager from "@/components/admin/ParticipationManager";
import TeamBuilder from "@/components/admin/TeamBuilder";
import { GameTypeBadge, ModeBadge, formatDate } from "@/components/ui/Badges";
import type { ParticipationModel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminParticipationPage({
  params,
}: {
  params: Promise<{ gameId: string; eventId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { gameId, eventId } = await params;
  const [game, event, rawRows] = await Promise.all([
    getGame(gameId),
    getEvent(eventId),
    getParticipations(eventId, gameId),
  ]);
  if (!game || !event) notFound();
  const rows = rawRows as ParticipationModel[];

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/events/${event.id}`}
        className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors text-sm"
      >
        <ArrowLeft size={18} className="mr-1.5" /> {event.title}
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{game.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <GameTypeBadge type={game.type} />
            <ModeBadge mode={event.mode} />
            <span className="text-sm text-gray-500">
              at {event.title} · {formatDate(event.date)}
            </span>
          </div>
        </div>
        <Link
          href={`/games/${game.id}/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green"
        >
          View public roster <ExternalLink size={14} />
        </Link>
      </div>

      {game.type === "team" && (
        <TeamBuilder rows={rows} eventId={event.id} gameId={game.id} />
      )}

      <ParticipationManager game={game} eventId={event.id} rows={rows} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPlayableGame, getEvent } from "@/lib/queries";
import PlayHost from "@/components/games/PlayHost";

export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ gameId: string; eventId: string }>;
}) {
  const { gameId, eventId } = await params;
  const [game, event] = await Promise.all([
    getPlayableGame(gameId),
    getEvent(eventId),
  ]);
  if (!game || !event) notFound();

  const playable = game.componentKey !== "";

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-brand-blue text-white py-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href={`/games/${game.id}/${event.id}`}
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors text-sm"
          >
            <ArrowLeft size={18} className="mr-1.5" /> Back to roster
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{game.title}</h1>
          <p className="text-blue-100 mt-1">
            {event.title} · play and your score is recorded automatically
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {playable ? (
          <PlayHost
            gameId={game.id}
            eventId={event.id}
            componentKey={game.componentKey}
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
            This game has no playable component. Scores are entered by an admin.
          </div>
        )}
      </div>
    </div>
  );
}

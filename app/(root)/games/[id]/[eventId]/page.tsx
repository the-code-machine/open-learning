import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPlayableGame, getEvent } from "@/lib/queries";
import PlayHost from "@/components/games/PlayHost";

export const dynamic = "force-dynamic";

/**
 * Play page — FULLSCREEN.
 *
 * The game takes over the entire viewport: position:fixed overlays sit above
 * the site's navbar and footer so the player isn't distracted by anything
 * else while they're playing. The only non-game UI is a floating "back to
 * roster" pill in the top-left and a small event/game header at the very top.
 *
 * This applies to ALL games via PlayHost — no per-game changes needed.
 */
export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id, eventId } = await params;
  const [game, event] = await Promise.all([
    getPlayableGame(id),
    getEvent(eventId),
  ]);
  if (!game || !event) notFound();

  const playable = game.componentKey !== "";

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto">
      {/* slim sticky header — no big hero, no navbar */}
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-brand-blue transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Back to roster
          </Link>
          <div className="text-right min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {game.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              {event.title}
            </p>
          </div>
        </div>
      </header>

      {/* game area — flex to vertically center on tall screens, scrolls if needed */}
      <main className="min-h-[calc(100vh-60px)] flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="w-full">
          {playable ? (
            <PlayHost
              gameId={game.id}
              eventId={event.id}
              componentKey={game.componentKey}
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500 max-w-md mx-auto">
              This game has no playable component. Scores are entered by an
              admin.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

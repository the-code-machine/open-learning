import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Gamepad2,
  Calendar,
  Users2,
  Trophy,
  Medal,
  ScrollText,
} from "lucide-react";
import { getGameDetail, getAllGameIds } from "@/lib/queries";
import {
  GameTypeBadge,
  ModeBadge,
  formatDate,
  brandGradient,
} from "@/components/ui/Badges";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const ids = await getAllGameIds();
  return ids.map((id) => ({ id }));
}

const RANK_STYLE = ["text-yellow-500", "text-gray-400", "text-amber-700"];

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGameDetail(id);
  if (!game) notFound();

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* HERO */}
      <section className="relative bg-brand-blue text-white py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/games"
            className="inline-flex items-center text-blue-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> All Games
          </Link>
          <div className="flex items-start gap-5">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${brandGradient(
                game.id,
              )} flex items-center justify-center text-white shrink-0 shadow-lg`}
            >
              <Gamepad2 size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <GameTypeBadge type={game.type} />
                <ModeBadge mode={game.mode} />
                {game.type === "team" && game.defaultTeamSize > 0 && (
                  <span className="text-xs text-blue-100">
                    Team size ~{game.defaultTeamSize}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight">
                {game.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm text-blue-100">
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> {game.eventCount}{" "}
                  {game.eventCount === 1 ? "event" : "events"}
                </span>
                <span className="flex items-center gap-2">
                  <Users2 size={16} /> {game.totalParticipants} total players
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this Game
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {game.description}
              </p>
              {game.rules.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ScrollText size={18} /> Rules & Scoring
                  </h3>
                  <ul className="space-y-3">
                    {game.rules.map((r, i) => (
                      <li key={i} className="flex gap-3 text-gray-600">
                        <span className="font-bold text-brand-blue shrink-0 min-w-20">
                          {r.label}
                        </span>
                        <span>{r.detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Played at (appearances) */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Played At
              </h2>
              {game.appearances.length > 0 ? (
                <div className="space-y-4">
                  {game.appearances.map(
                    ({ event, note, participantCount, winnerCount }) => (
                      <Link
                        key={event.id}
                        href={`/games/${game.id}/${event.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-blue-50/40 transition-colors group"
                      >
                        <div className="text-center shrink-0 w-16">
                          <span className="block text-xs font-bold text-gray-400 uppercase">
                            {formatDate(event.date).split(" ")[0]}
                          </span>
                          <span className="block text-2xl font-bold text-brand-red leading-none">
                            {event.date.split("-")[2]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                            {event.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {note ? `${note} · ` : ""}
                            {participantCount} players · {winnerCount} winners
                          </p>
                        </div>
                        <ArrowRight
                          size={18}
                          className="text-gray-300 group-hover:text-brand-blue shrink-0"
                        />
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-500">
                  This game has not been played at any event yet.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT: leaderboard */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border-t-4 border-brand-green overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                  <Trophy className="text-brand-green" size={22} />
                  <h3 className="font-bold text-gray-900 text-lg">
                    All-time Leaderboard
                  </h3>
                </div>
                {game.leaderboard.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {game.leaderboard.slice(0, 15).map((entry, i) => (
                      <li
                        key={entry.participantName}
                        className="flex items-center gap-3 px-6 py-3"
                      >
                        <span className="w-6 text-center font-bold text-gray-400 shrink-0">
                          {i < 3 ? (
                            <Medal size={18} className={RANK_STYLE[i]} />
                          ) : (
                            i + 1
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {entry.participantName}
                          </p>
                          {entry.participantWiki && (
                            <p className="text-xs text-gray-400 truncate">
                              {entry.participantWiki}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-brand-blue">
                            {entry.wins} {entry.wins === 1 ? "win" : "wins"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {entry.appearances} played
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 py-8 text-center text-gray-400 text-sm">
                    No results recorded yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy, Users2, User, Crown } from "lucide-react";
import {
  getGameDetail,
  getEventDetail,
  getParticipations,
} from "@/lib/queries";
import { isAdmin } from "@/lib/auth";
import {
  GameTypeBadge,
  ModeBadge,
  formatDate,
  brandGradient,
} from "@/components/ui/Badges";
import type { ParticipationModel, TeamGroup } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GameEventPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id, eventId } = await params;
  const [game, event, rawRows, admin] = await Promise.all([
    getGameDetail(id),
    getEventDetail(eventId),
    getParticipations(eventId, id),
    isAdmin(),
  ]);
  if (!game || !event) notFound();

  const rows = rawRows as ParticipationModel[];

  // Group by team for team games; flat ranked list for individual games.
  const teamGroups: TeamGroup[] = [];
  if (game.type === "team") {
    const map = new Map<string, TeamGroup>();
    for (const r of rows) {
      const key = r.teamName ?? "Unassigned";
      if (!map.has(key)) {
        map.set(key, {
          teamName: key,
          members: [],
          isWinner: false,
          totalScore: 0,
        });
      }
      const g = map.get(key)!;
      g.members.push(r);
      if (r.isWinner) g.isWinner = true;
      g.totalScore += r.score ?? 0;
    }
    teamGroups.push(
      ...[...map.values()].sort((a, b) => b.totalScore - a.totalScore),
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* HERO */}
      <section className="relative bg-brand-blue text-white py-14 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <Link
              href={`/games/${game.id}`}
              className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" /> {game.title}
            </Link>
            <span className="text-blue-200">/</span>
            <Link
              href={`/events/${event.id}`}
              className="text-blue-100 hover:text-white transition-colors"
            >
              {event.title}
            </Link>
          </div>

          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brandGradient(
                game.id,
              )} flex items-center justify-center text-white shrink-0 shadow-lg`}
            >
              {game.type === "team" ? <Users2 size={30} /> : <User size={30} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GameTypeBadge type={game.type} />
                <ModeBadge mode={event.mode} />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                {game.title}
              </h1>
              <p className="text-blue-100 mt-1">
                at {event.title} · {formatDate(event.date)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROSTER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="text-brand-green" size={20} /> Results &
              Participants
            </h2>
            <span className="text-sm text-gray-400">
              {rows.length} {rows.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="px-6 py-12 text-center text-gray-400">
              No participants recorded for this game yet.
            </p>
          ) : game.type === "team" ? (
            // TEAM VIEW
            <div className="divide-y divide-gray-100">
              {teamGroups.map((team) => (
                <div key={team.teamName} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {team.isWinner && (
                        <Crown size={18} className="text-yellow-500" />
                      )}
                      {team.teamName}
                      {team.isWinner && (
                        <span className="text-xs font-bold uppercase bg-brand-green text-white px-2 py-0.5 rounded-full">
                          Winner
                        </span>
                      )}
                    </h3>
                    <span className="text-sm font-bold text-brand-blue">
                      {team.totalScore} pts
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {team.members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm font-bold shrink-0">
                          {m.participantName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {m.participantName}
                            {m.role === "captain" && (
                              <span className="ml-1.5 text-xs text-brand-red font-bold">
                                (C)
                              </span>
                            )}
                          </p>
                          {m.participantWiki && (
                            <p className="text-xs text-gray-400 truncate">
                              {m.participantWiki}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // INDIVIDUAL VIEW (ranked table)
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 font-semibold w-16">Rank</th>
                  <th className="px-6 py-3 font-semibold">Participant</th>
                  <th className="px-6 py-3 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className={r.isWinner ? "bg-brand-green/5" : ""}
                  >
                    <td className="px-6 py-4 font-bold text-gray-500">
                      {r.rank ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold shrink-0">
                          {r.participantName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                            {r.participantName}
                            {r.isWinner && (
                              <Crown size={14} className="text-yellow-500" />
                            )}
                          </p>
                          {r.participantWiki && (
                            <p className="text-xs text-gray-400 truncate">
                              {r.participantWiki}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-brand-blue">
                      {r.score ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {admin ? (
          <div className="text-center mt-6">
            <Link
              href={`/admin/participations/${game.id}/${event.id}`}
              className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors"
            >
              Edit this roster
            </Link>
          </div>
        ) : null}

        {game.componentKey ? (
          <div className="text-center mt-4">
            <Link
              href={`/play/${game.id}/${event.id}`}
              className="inline-flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-blue transition-colors"
            >
              Play this game
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

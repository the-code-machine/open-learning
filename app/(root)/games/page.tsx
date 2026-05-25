import { getAllGames } from "@/lib/queries";
import GamesGrid from "@/components/ui/Gamesgrid";
import { Users, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const games = await getAllGames();
  const teamCount = games.filter((g) => g.type === "team").length;
  const soloCount = games.filter((g) => g.type === "individual").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-brand-blue text-white pt-14 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4">Games & Activities</h1>
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Every game we run across our events. Team games and individual
            challenges, online and offline. Each game keeps its own history and
            leaderboard across every event it has appeared in.
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-brand-green" />
              <span className="font-bold">{teamCount}</span>
              <span className="text-blue-100 text-sm">team games</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={20} className="text-brand-green" />
              <span className="font-bold">{soloCount}</span>
              <span className="text-blue-100 text-sm">individual games</span>
            </div>
          </div>
        </div>
      </section>

      {/* GRID + FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {games.length > 0 ? (
          <GamesGrid games={games} />
        ) : (
          <p className="text-center text-gray-400 py-16">
            No games yet. They will appear here once added.
          </p>
        )}
      </section>
    </div>
  );
}

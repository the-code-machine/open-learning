import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  Gamepad2,
  Plus,
  Pencil,
  Calendar,
  Users2,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getAllEvents, getAllGames } from "@/lib/queries";
import { GameTypeBadge, StatusBadge, formatDate } from "@/components/ui/Badges";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [events, games] = await Promise.all([getAllEvents(), getAllGames()]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage events, games, and participation records.
        </p>
      </div>

      {/* EVENTS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-brand-blue" /> Events
            <span className="text-gray-400 font-normal">({events.length})</span>
          </h2>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors"
          >
            <CalendarPlus size={16} /> New Event
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {events.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {events.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">
                        {e.title}
                      </span>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {formatDate(e.date)} · {e.id}
                    </p>
                  </div>
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors shrink-0"
                  >
                    <Pencil size={15} /> Manage
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-gray-400">
              No events yet. Create your first one.
            </p>
          )}
        </div>
      </section>

      {/* GAMES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Gamepad2 size={20} className="text-brand-blue" /> Games
            <span className="text-gray-400 font-normal">({games.length})</span>
          </h2>
          <Link
            href="/admin/games/new"
            className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors"
          >
            <Plus size={16} /> New Game
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {games.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {games.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">
                        {g.title}
                      </span>
                      <GameTypeBadge type={g.type} />
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-3">
                      <span>{g.id}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> {g.eventCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users2 size={13} /> {g.totalParticipants}
                      </span>
                    </p>
                  </div>
                  <Link
                    href={`/admin/games/${g.id}`}
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors shrink-0"
                  >
                    <Pencil size={15} /> Manage
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-gray-400">
              No games yet. Create your first one.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

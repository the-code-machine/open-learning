import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  Plus,
  Users2,
  Link2Off,
  Gamepad2,
} from "lucide-react";
import { isAdmin } from "@/lib/auth";
import {
  getEventDetail,
  getGameOptions,
  getLinkedGameIds,
  getEventRegistrations,
} from "@/lib/queries";
import {
  updateEventAction,
  deleteEventAction,
  linkGameToEventAction,
  unlinkGameFromEventAction,
} from "@/lib/actions";
import EventForm from "@/components/admin/EventForm";
import RegistrationsPanel from "@/components/admin/RegistrationsPanel";
import { GameTypeBadge } from "@/components/ui/Badges";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const [event, allGames, linkedIds, eventRegistrations] = await Promise.all([
    getEventDetail(id),
    getGameOptions(),
    getLinkedGameIds(id),
    getEventRegistrations(id),
  ]);
  if (!event) notFound();

  const unlinkedGames = allGames.filter((g) => !linkedIds.includes(g.id));
  const gameTitleById: Record<string, string> = Object.fromEntries(
    allGames.map((g) => [g.id, g.title]),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-500 hover:text-brand-blue transition-colors text-sm"
      >
        <ArrowLeft size={18} className="mr-1.5" /> Dashboard
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green"
        >
          View public page <ExternalLink size={14} />
        </Link>
      </div>

      <EventForm action={updateEventAction} initial={event} />

      {/* GAMES IN THIS EVENT */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Gamepad2 size={18} className="text-brand-blue" /> Games in this event
        </h2>

        {event.games.length > 0 ? (
          <ul className="divide-y divide-gray-100 mb-6">
            {event.games.map(({ game, participantCount, note }) => (
              <li key={game.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {game.title}
                    </span>
                    <GameTypeBadge type={game.type} />
                  </div>
                  <p className="text-sm text-gray-400">
                    {note ? `${note} · ` : ""}
                    {participantCount} participants
                  </p>
                </div>
                <Link
                  href={`/admin/participations/${game.id}/${event.id}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors shrink-0"
                >
                  <Users2 size={15} /> Manage roster
                </Link>
                <form action={unlinkGameFromEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <input type="hidden" name="gameId" value={game.id} />
                  <button
                    className="p-2 text-gray-400 hover:text-brand-red transition-colors"
                    title="Unlink game from event"
                  >
                    <Link2Off size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 mb-6">
            No games linked to this event yet.
          </p>
        )}

        {/* Add game */}
        {unlinkedGames.length > 0 ? (
          <form
            action={linkGameToEventAction}
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end border-t border-gray-100 pt-5"
          >
            <input type="hidden" name="eventId" value={event.id} />
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Add a game
              </label>
              <select
                name="gameId"
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
              >
                {unlinkedGames.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Note (optional)
              </label>
              <input
                name="note"
                placeholder="Round 1"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue outline-none text-sm"
              />
            </div>
            <button className="flex items-center justify-center gap-1.5 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors">
              <Plus size={16} /> Link
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400 border-t border-gray-100 pt-5">
            All games are already linked.{" "}
            <Link
              href="/admin/games/new"
              className="text-brand-blue font-semibold"
            >
              Create a new game
            </Link>{" "}
            to add more.
          </p>
        )}
      </section>

      {/* REGISTRATIONS */}
      <RegistrationsPanel
        eventId={event.id}
        registrations={eventRegistrations}
        gameTitleById={gameTitleById}
      />

      {/* DANGER */}
      <form
        action={deleteEventAction}
        className="bg-red-50 border border-red-100 rounded-xl p-6"
      >
        <input type="hidden" name="id" value={event.id} />
        <h2 className="font-bold text-brand-red mb-2">Danger zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Deleting this event also removes its game links and all participation
          records. This cannot be undone.
        </p>
        <button className="flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors">
          <Trash2 size={16} /> Delete event
        </button>
      </form>
    </div>
  );
}

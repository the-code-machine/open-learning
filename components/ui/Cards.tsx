import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight, Gamepad2, Users2 } from "lucide-react";
import type { EventModel, GameSummary } from "@/lib/types";
import {
  ModeBadge,
  GameTypeBadge,
  StatusBadge,
  formatShortDate,
  formatDate,
  brandGradient,
} from "./Badges";

export function EventCard({ event }: { event: EventModel }) {
  const short = formatShortDate(event.date);
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col">
      <div className="relative h-44 overflow-hidden">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${brandGradient(
              event.id,
            )} flex items-center justify-center text-white font-bold text-lg opacity-90 group-hover:scale-105 transition-transform duration-500`}
          >
            {event.category}
          </div>
        )}
        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-white rounded-lg p-2 text-center shadow-md min-w-14">
          <span className="block text-xs font-bold text-gray-500 uppercase">
            {short.month}
          </span>
          <span className="block text-xl font-bold text-brand-red leading-none">
            {short.day}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <ModeBadge mode={event.mode} />
          <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">
            {event.category}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} /> {formatDate(event.date)}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} /> {event.location}
            </div>
          )}
        </div>

        <Link
          href={`/events/${event.id}`}
          className="mt-auto block w-full text-center py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:border-brand-blue hover:text-brand-blue transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export function GameCard({ game }: { game: GameSummary }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col">
      <div className="relative h-40 overflow-hidden">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${brandGradient(
              game.id,
            )} flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-500`}
          >
            <Gamepad2 size={48} className="opacity-90" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <GameTypeBadge type={game.type} />
          <ModeBadge mode={game.mode} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
          {game.title}
        </h3>
        <p className="text-sm text-gray-600 mb-6 line-clamp-2 flex-1">
          {game.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={15} /> {game.eventCount}{" "}
            {game.eventCount === 1 ? "event" : "events"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users2 size={15} /> {game.totalParticipants} players
          </span>
        </div>

        <Link
          href={`/games/${game.id}`}
          className="flex items-center justify-center gap-2 w-full text-center py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-green transition-colors"
        >
          View Game <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

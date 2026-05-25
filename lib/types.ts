/**
 * Public domain types.
 *
 * These are the shapes the UI works with. They differ from the raw Drizzle
 * row types (in db/schema.ts) in that JSON-text columns are parsed into real
 * objects/arrays here. The query layer (lib/queries.ts) does that parsing.
 */

export type Mode = "online" | "offline" | "hybrid";
export type EventStatus = "upcoming" | "ongoing" | "past";
export type GameType = "team" | "individual";
export type ParticipantRole = "player" | "captain";
export type RegistrationStatus = "pending" | "selected" | "rejected";

export interface TimelineItem {
  time: string;
  title: string;
}

export interface Facilitator {
  name: string;
  role?: string;
  wiki?: string;
  photo?: string;
}

export interface Organiser {
  name: string;
  role?: string;
  contact?: string;
}

export interface RuleItem {
  label: string;
  detail: string;
}

/** Event with JSON fields parsed. */
export interface EventModel {
  id: string;
  title: string;
  details: string;
  date: string; // YYYY-MM-DD
  time: string;
  mode: Mode;
  location: string;
  status: EventStatus;
  category: string;
  coverImage: string | null;
  timeline: TimelineItem[];
  facilitators: Facilitator[];
  organisers: Organiser[];
  createdAt: Date;
}

/** Game with JSON fields parsed. */
export interface GameModel {
  id: string;
  title: string;
  description: string;
  type: GameType;
  mode: Mode;
  defaultTeamSize: number;
  coverImage: string | null;
  rules: RuleItem[];
  componentKey: string;
  maxScore: number;
  createdAt: Date;
}

export interface ParticipationModel {
  id: number;
  eventId: string;
  gameId: string;
  participantName: string;
  participantWiki: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  teamName: string | null;
  role: ParticipantRole;
  score: number | null;
  rank: number | null;
  isWinner: boolean;
  createdAt: Date;
}

export interface RegistrationModel {
  id: number;
  eventId: string;
  gameId: string | null;
  name: string;
  email: string;
  phone: string | null;
  wikiHandle: string | null;
  message: string;
  teamPreference: string | null;
  status: RegistrationStatus;
  createdAt: Date;
  reviewedAt: Date | null;
}

/* ---------- Derived / composite shapes for pages ---------- */

/** A game as it appears attached to a specific event. */
export interface EventGameLink {
  game: GameModel;
  sortOrder: number;
  note: string;
  participantCount: number;
}

/** Full event detail payload for /events/[event_id]. */
export interface EventDetail extends EventModel {
  games: EventGameLink[];
}

/** Summary card for /games listing. */
export interface GameSummary extends GameModel {
  eventCount: number;
  totalParticipants: number;
}

/** One event in which a game was played, for /games/[game_id]. */
export interface GameEventAppearance {
  event: EventModel;
  note: string;
  participantCount: number;
  winnerCount: number;
}

/** A leaderboard row aggregated across all events for one game. */
export interface LeaderboardEntry {
  participantName: string;
  participantWiki: string | null;
  appearances: number;
  wins: number;
  bestRank: number | null;
  totalScore: number;
}

/** Full game detail payload for /games/[game_id]. */
export interface GameDetail extends GameModel {
  appearances: GameEventAppearance[];
  leaderboard: LeaderboardEntry[];
  eventCount: number;
  totalParticipants: number;
}

/** Roster grouping for /games/[game_id]/[event_id] (built in Phase 3). */
export interface TeamGroup {
  teamName: string;
  members: ParticipationModel[];
  isWinner: boolean;
  totalScore: number;
}

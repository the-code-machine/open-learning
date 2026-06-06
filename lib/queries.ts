import { db } from "@/db";
import {
  events,
  games,
  eventGames,
  participations,
  registrations,
} from "@/db/schema";
import { and, eq, sql, desc, asc, count } from "drizzle-orm";
import type {
  EventModel,
  GameModel,
  EventDetail,
  GameSummary,
  GameDetail,
  EventGameLink,
  GameEventAppearance,
  LeaderboardEntry,
  EventStatus,
  RegistrationModel,
  RegistrationStatus,
  TimelineItem,
  Facilitator,
  Organiser,
  GalleryImage,
  EventLink,
  RuleItem,
} from "./types";
import type { EventRow, GameRow, RegistrationRow } from "@/db/schema";
import registryJson from "./games-registry.json";

export interface RegistryComponent {
  key: string;
  label: string;
  description: string;
  defaultMaxScore: number;
}

/** Components available to attach to a game (read from games-registry.json). */
export function getRegistryComponents(): RegistryComponent[] {
  return (registryJson.components ?? []) as RegistryComponent[];
}

/* ---------- JSON parse helpers (DB stores JSON as text) ---------- */

function safeParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapEvent(row: EventRow): EventModel {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    date: row.date,
    time: row.time,
    mode: row.mode,
    location: row.location,
    status: row.status,
    category: row.category,
    coverImage: row.coverImage ?? null,
    timeline: safeParse<TimelineItem[]>(row.timeline, []),
    facilitators: safeParse<Facilitator[]>(row.facilitators, []),
    organisers: safeParse<Organiser[]>(row.organisers, []),
    gallery: safeParse<GalleryImage[]>(row.gallery, []),
    links: safeParse<EventLink[]>(row.links, []),
    createdAt: row.createdAt,
  };
}

function mapGame(row: GameRow): GameModel {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    mode: row.mode,
    defaultTeamSize: row.defaultTeamSize ?? 0,
    coverImage: row.coverImage ?? null,
    rules: safeParse<RuleItem[]>(row.rules, []),
    componentKey: row.componentKey ?? "",
    maxScore: row.maxScore ?? 0,
    createdAt: row.createdAt,
  };
}

/* ---------- EVENTS ---------- */

export async function getAllEvents(): Promise<EventModel[]> {
  const rows = await db.select().from(events).orderBy(desc(events.date));
  return rows.map(mapEvent);
}

export async function getEventsByStatus(
  status: EventStatus,
): Promise<EventModel[]> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.status, status))
    .orderBy(desc(events.date));
  return rows.map(mapEvent);
}

export async function getEventDetail(
  eventId: string,
): Promise<EventDetail | null> {
  const [row] = await db.select().from(events).where(eq(events.id, eventId));
  if (!row) return null;

  // games attached to this event, with per-game participant counts
  const links = await db
    .select({
      game: games,
      sortOrder: eventGames.sortOrder,
      note: eventGames.note,
      participantCount: sql<number>`(
        select count(*) from ${participations}
        where ${participations.eventId} = ${eventId}
          and ${participations.gameId} = ${games.id}
      )`,
    })
    .from(eventGames)
    .innerJoin(games, eq(eventGames.gameId, games.id))
    .where(eq(eventGames.eventId, eventId))
    .orderBy(asc(eventGames.sortOrder));

  const gameLinks: EventGameLink[] = links.map((l) => ({
    game: mapGame(l.game),
    sortOrder: l.sortOrder,
    note: l.note,
    participantCount: Number(l.participantCount ?? 0),
  }));

  return { ...mapEvent(row), games: gameLinks };
}

export async function getAllEventIds(): Promise<string[]> {
  const rows = await db.select({ id: events.id }).from(events);
  return rows.map((r) => r.id);
}

/* ---------- GAMES ---------- */

export async function getAllGames(): Promise<GameSummary[]> {
  const rows = await db.select().from(games).orderBy(asc(games.title));

  // counts per game in two small grouped queries (cheap at this scale)
  const eventCounts = await db
    .select({
      gameId: eventGames.gameId,
      c: count().as("c"),
    })
    .from(eventGames)
    .groupBy(eventGames.gameId);

  const partCounts = await db
    .select({
      gameId: participations.gameId,
      c: count().as("c"),
    })
    .from(participations)
    .groupBy(participations.gameId);

  const eventCountMap = new Map(
    eventCounts.map((r) => [r.gameId, Number(r.c)]),
  );
  const partCountMap = new Map(partCounts.map((r) => [r.gameId, Number(r.c)]));

  return rows.map((row) => ({
    ...mapGame(row),
    eventCount: eventCountMap.get(row.id) ?? 0,
    totalParticipants: partCountMap.get(row.id) ?? 0,
  }));
}

export async function getGameDetail(
  gameId: string,
): Promise<GameDetail | null> {
  const [row] = await db.select().from(games).where(eq(games.id, gameId));
  if (!row) return null;

  // every event this game appeared in, with counts + winner counts
  const appearanceRows = await db
    .select({
      event: events,
      note: eventGames.note,
      participantCount: sql<number>`(
        select count(*) from ${participations}
        where ${participations.gameId} = ${gameId}
          and ${participations.eventId} = ${events.id}
      )`,
      winnerCount: sql<number>`(
        select count(*) from ${participations}
        where ${participations.gameId} = ${gameId}
          and ${participations.eventId} = ${events.id}
          and ${participations.isWinner} = 1
      )`,
    })
    .from(eventGames)
    .innerJoin(events, eq(eventGames.eventId, events.id))
    .where(eq(eventGames.gameId, gameId))
    .orderBy(desc(events.date));

  const appearances: GameEventAppearance[] = appearanceRows.map((a) => ({
    event: mapEvent(a.event),
    note: a.note,
    participantCount: Number(a.participantCount ?? 0),
    winnerCount: Number(a.winnerCount ?? 0),
  }));

  // leaderboard aggregated across ALL events for this game
  const lbRows = await db
    .select({
      participantName: participations.participantName,
      participantWiki: sql<
        string | null
      >`max(${participations.participantWiki})`,
      appearances: count().as("appearances"),
      wins: sql<number>`sum(case when ${participations.isWinner} = 1 then 1 else 0 end)`,
      bestRank: sql<number | null>`min(${participations.rank})`,
      totalScore: sql<number>`coalesce(sum(${participations.score}), 0)`,
    })
    .from(participations)
    .where(eq(participations.gameId, gameId))
    .groupBy(participations.participantName)
    .orderBy(
      desc(
        sql`sum(case when ${participations.isWinner} = 1 then 1 else 0 end)`,
      ),
      desc(sql`coalesce(sum(${participations.score}), 0)`),
    );

  const leaderboard: LeaderboardEntry[] = lbRows.map((r) => ({
    participantName: r.participantName,
    participantWiki: r.participantWiki ?? null,
    appearances: Number(r.appearances ?? 0),
    wins: Number(r.wins ?? 0),
    bestRank: r.bestRank == null ? null : Number(r.bestRank),
    totalScore: Number(r.totalScore ?? 0),
  }));

  const totalParticipants = appearances.reduce(
    (sum, a) => sum + a.participantCount,
    0,
  );

  return {
    ...mapGame(row),
    appearances,
    leaderboard,
    eventCount: appearances.length,
    totalParticipants,
  };
}

export async function getAllGameIds(): Promise<string[]> {
  const rows = await db.select({ id: games.id }).from(games);
  return rows.map((r) => r.id);
}

/** Valid (gameId, eventId) pairs — used to generate static params in Phase 3. */
export async function getAllGameEventPairs(): Promise<
  { gameId: string; eventId: string }[]
> {
  const rows = await db
    .select({ gameId: eventGames.gameId, eventId: eventGames.eventId })
    .from(eventGames);
  return rows;
}

/* ---------- ADMIN read helpers ---------- */

/** Single event (parsed) for the edit form. */
export async function getEvent(eventId: string): Promise<EventModel | null> {
  const [row] = await db.select().from(events).where(eq(events.id, eventId));
  return row ? mapEvent(row) : null;
}

/** Single game (parsed) for the edit form. */
export async function getGame(gameId: string): Promise<GameModel | null> {
  const [row] = await db.select().from(games).where(eq(games.id, gameId));
  return row ? mapGame(row) : null;
}

/** Lightweight list of all games (id + title + type) for link pickers. */
export async function getGameOptions(): Promise<
  { id: string; title: string; type: GameModel["type"] }[]
> {
  const rows = await db
    .select({ id: games.id, title: games.title, type: games.type })
    .from(games)
    .orderBy(asc(games.title));
  return rows;
}

/** Lightweight list of all events (id + title + date) for link pickers. */
export async function getEventOptions(): Promise<
  { id: string; title: string; date: string }[]
> {
  const rows = await db
    .select({ id: events.id, title: events.title, date: events.date })
    .from(events)
    .orderBy(desc(events.date));
  return rows;
}

/** Game ids already linked to an event (to exclude from the add picker). */
export async function getLinkedGameIds(eventId: string): Promise<string[]> {
  const rows = await db
    .select({ gameId: eventGames.gameId })
    .from(eventGames)
    .where(eq(eventGames.eventId, eventId));
  return rows.map((r) => r.gameId);
}

/* ---------- PARTICIPATIONS (read side) ---------- */

export async function getParticipations(eventId: string, gameId: string) {
  return db
    .select()
    .from(participations)
    .where(
      and(
        eq(participations.eventId, eventId),
        eq(participations.gameId, gameId),
      ),
    )
    .orderBy(asc(participations.rank), desc(participations.score));
}

/* ---------- REGISTRATIONS ---------- */

function mapRegistration(row: RegistrationRow): RegistrationModel {
  return {
    id: row.id,
    eventId: row.eventId,
    gameId: row.gameId ?? null,
    name: row.name,
    email: row.email,
    phone: row.phone ?? null,
    wikiHandle: row.wikiHandle ?? null,
    message: row.message,
    teamPreference: row.teamPreference ?? null,
    status: row.status,
    createdAt: row.createdAt,
    reviewedAt: row.reviewedAt ?? null,
  };
}

/** All registrations for an event (admin view), newest first. */
export async function getEventRegistrations(
  eventId: string,
): Promise<RegistrationModel[]> {
  const rows = await db
    .select()
    .from(registrations)
    .where(eq(registrations.eventId, eventId))
    .orderBy(desc(registrations.createdAt));
  return rows.map(mapRegistration);
}

/** Public "Selected Participants" list for an event. */
export async function getSelectedRegistrations(
  eventId: string,
): Promise<RegistrationModel[]> {
  const rows = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.status, "selected"),
      ),
    )
    .orderBy(asc(registrations.name));
  return rows.map(mapRegistration);
}

/** Count registrations grouped by status for an event (for admin badges). */
export async function getRegistrationCounts(
  eventId: string,
): Promise<Record<RegistrationStatus, number>> {
  const rows = await db
    .select({ status: registrations.status, c: count().as("c") })
    .from(registrations)
    .where(eq(registrations.eventId, eventId))
    .groupBy(registrations.status);
  const out: Record<RegistrationStatus, number> = {
    pending: 0,
    selected: 0,
    rejected: 0,
  };
  for (const r of rows) out[r.status] = Number(r.c);
  return out;
}

/* ---------- PLAYABLE GAME config ---------- */

export interface PlayableGame {
  id: string;
  title: string;
  type: GameModel["type"];
  componentKey: string;
  maxScore: number;
  config: unknown;
}

/** Load a game's playable info (parsed config) for the /play route. */
export async function getPlayableGame(
  gameId: string,
): Promise<PlayableGame | null> {
  const [row] = await db.select().from(games).where(eq(games.id, gameId));
  if (!row) return null;
  let config: unknown = {};
  try {
    config = JSON.parse(row.config ?? "{}");
  } catch {
    config = {};
  }
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    componentKey: row.componentKey ?? "",
    maxScore: row.maxScore ?? 0,
    config,
  };
}

import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * EVENTS
 * A top-level happening. An event contains one or more games (via event_games).
 * The `id` is a human-readable slug, used directly in the URL: /events/[id]
 */
export const events = sqliteTable("events", {
  // slug, e.g. "wiki-hackathon-2025"
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  details: text("details").notNull().default(""),
  // ISO date string YYYY-MM-DD for the primary/sort date
  date: text("date").notNull(),
  // free-text human window, e.g. "10:00 AM - 6:00 PM"
  time: text("time").notNull().default(""),
  // online | offline | hybrid
  mode: text("mode", { enum: ["online", "offline", "hybrid"] })
    .notNull()
    .default("offline"),
  location: text("location").notNull().default(""),
  // upcoming | ongoing | past  (drives Upcoming/Past split on /events)
  status: text("status", { enum: ["upcoming", "ongoing", "past"] })
    .notNull()
    .default("upcoming"),
  category: text("category").notNull().default("Event"),
  coverImage: text("cover_image"),
  // Structured fields stored as JSON text (SQLite has no native JSON column,
  // libSQL parses on read via the helpers in lib/queries.ts).
  // timeline: [{ time: string, title: string }]
  timeline: text("timeline").notNull().default("[]"),
  // facilitators: [{ name, role?, wiki?, photo? }]
  facilitators: text("facilitators").notNull().default("[]"),
  // organisers: [{ name, role?, contact? }]
  organisers: text("organisers").notNull().default("[]"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * GAMES
 * A reusable activity. The SAME game can be attached to MANY events.
 * That reusability is exactly why games live in their own table rather than
 * being nested inside an event. URL: /games/[id]
 */
export const games = sqliteTable("games", {
  // slug, e.g. "quiz-bowl"
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // team | individual
  type: text("type", { enum: ["team", "individual"] })
    .notNull()
    .default("individual"),
  // online | offline | hybrid  (the game's general mode; an event can still
  // be a different mode overall)
  mode: text("mode", { enum: ["online", "offline", "hybrid"] })
    .notNull()
    .default("offline"),
  // suggested team size for team games (null/0 for individual)
  defaultTeamSize: integer("default_team_size").default(0),
  coverImage: text("cover_image"),
  // rules / scoring as JSON text: [{ label, detail }]
  rules: text("rules").notNull().default("[]"),
  // --- Part 2 hooks (playable games) ---
  // Key mapping this game to a React component in lib/games-registry.json.
  // Empty string = no playable component (manual / live-scored game).
  componentKey: text("component_key").notNull().default(""),
  // Maximum achievable score for the playable component (0 = not applicable).
  maxScore: integer("max_score").notNull().default(0),
  // Component-specific configuration as JSON text (e.g. quiz questions).
  // Shape depends on componentKey; each component defines its own config type.
  config: text("config").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * EVENT_GAMES  (join table)
 * One row = "this game, as played inside this event".
 * This is what makes /games/[game_id]/[event_id] a real, addressable thing.
 * Composite primary key (eventId, gameId) prevents the same game being added
 * to the same event twice.
 */
export const eventGames = sqliteTable(
  "event_games",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    // display order of the game within the event
    sortOrder: integer("sort_order").notNull().default(0),
    // optional per-event note ("Round 1", "Finals only", etc.)
    note: text("note").notNull().default(""),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.gameId] }),
    byGame: index("event_games_game_idx").on(t.gameId),
  }),
);

/**
 * PARTICIPATIONS
 * One row = one person's participation in one game within one event.
 * Keyed on BOTH event_id and game_id so:
 *  - the same person can appear in multiple games of the same event
 *  - stats (wins, participation counts, leaderboards) aggregate cleanly
 * Stats are NOT a stored table; they are computed from these rows.
 */
export const participations = sqliteTable(
  "participations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    gameId: text("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    participantName: text("participant_name").notNull(),
    // optional Wikimedia username / handle
    participantWiki: text("participant_wiki"),
    // Contact identity copied from the registration when the person is selected.
    // Normalized email or phone — this is what the play page matches against so
    // a score can only be recorded by the real selected person (not by name).
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    // null for individual games
    teamName: text("team_name"),
    // player | captain
    role: text("role", { enum: ["player", "captain"] })
      .notNull()
      .default("player"),
    score: integer("score"),
    rank: integer("rank"),
    isWinner: integer("is_winner", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    byEventGame: index("participations_event_game_idx").on(t.eventId, t.gameId),
    byGame: index("participations_game_idx").on(t.gameId),
    byName: index("participations_name_idx").on(t.participantName),
  }),
);

/**
 * REGISTRATIONS
 * A public application to join an event (no login required).
 * Distinct from PARTICIPATIONS: a registration is a request to take part,
 * reviewed by an admin. A participation is an actual scored roster entry.
 * Approving a registration does NOT auto-create a participation — selected
 * applicants simply appear in the event's "Selected Participants" list.
 */
export const registrations = sqliteTable(
  "registrations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    // optional: applying to a specific game within the event (null = whole event)
    gameId: text("game_id").references(() => games.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    // optional phone; either email or phone can identify the player at play time
    phone: text("phone"),
    wikiHandle: text("wiki_handle"),
    message: text("message").notNull().default(""),
    teamPreference: text("team_preference"),
    // pending | selected | rejected
    status: text("status", { enum: ["pending", "selected", "rejected"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  },
  (t) => ({
    byEvent: index("registrations_event_idx").on(t.eventId),
    byStatus: index("registrations_status_idx").on(t.eventId, t.status),
  }),
);

// Drizzle inferred row types (raw DB shape, JSON fields are still strings here)
export type EventRow = typeof events.$inferSelect;
export type GameRow = typeof games.$inferSelect;
export type EventGameRow = typeof eventGames.$inferSelect;
export type ParticipationRow = typeof participations.$inferSelect;
export type RegistrationRow = typeof registrations.$inferSelect;

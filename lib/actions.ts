"use server";

import { db } from "@/db";
import {
  events,
  games,
  eventGames,
  participations,
  registrations,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin, login, logout } from "./auth";
import type {
  Mode,
  EventStatus,
  GameType,
  ParticipantRole,
  RegistrationStatus,
} from "./types";

/* ---------- helpers ---------- */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function str(form: FormData, key: string): string {
  return (form.get(key) ?? "").toString().trim();
}

function num(form: FormData, key: string): number | null {
  const v = str(form, key);
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ---------- AUTH actions ---------- */

export async function loginAction(formData: FormData) {
  const secret = str(formData, "secret");
  const ok = await login(secret);
  if (!ok) redirect("/admin/login?error=1");
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

/* ---------- EVENT actions ---------- */

export async function createEventAction(formData: FormData) {
  await assertAdmin();
  const title = str(formData, "title");
  if (!title) throw new Error("Title is required.");

  const id = str(formData, "id") || slugify(title);

  await db.insert(events).values({
    id,
    title,
    details: str(formData, "details"),
    date: str(formData, "date"),
    time: str(formData, "time"),
    mode: (str(formData, "mode") || "offline") as Mode,
    location: str(formData, "location"),
    status: (str(formData, "status") || "upcoming") as EventStatus,
    category: str(formData, "category") || "Event",
    coverImage: str(formData, "coverImage") || null,
    // structured fields arrive as JSON strings from the form's hidden inputs
    timeline: str(formData, "timeline") || "[]",
    facilitators: str(formData, "facilitators") || "[]",
    organisers: str(formData, "organisers") || "[]",
  });

  revalidatePath("/events");
  revalidatePath("/admin");
  redirect(`/admin/events/${id}`);
}

export async function updateEventAction(formData: FormData) {
  await assertAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("Event id missing.");

  await db
    .update(events)
    .set({
      title: str(formData, "title"),
      details: str(formData, "details"),
      date: str(formData, "date"),
      time: str(formData, "time"),
      mode: (str(formData, "mode") || "offline") as Mode,
      location: str(formData, "location"),
      status: (str(formData, "status") || "upcoming") as EventStatus,
      category: str(formData, "category") || "Event",
      coverImage: str(formData, "coverImage") || null,
      timeline: str(formData, "timeline") || "[]",
      facilitators: str(formData, "facilitators") || "[]",
      organisers: str(formData, "organisers") || "[]",
    })
    .where(eq(events.id, id));

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  await assertAdmin();
  const id = str(formData, "id");
  // cascade removes event_games + participations for this event
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/admin");
}

/* ---------- GAME actions ---------- */

export async function createGameAction(formData: FormData) {
  await assertAdmin();
  const title = str(formData, "title");
  if (!title) throw new Error("Title is required.");
  const id = str(formData, "id") || slugify(title);

  await db.insert(games).values({
    id,
    title,
    description: str(formData, "description"),
    type: (str(formData, "type") || "individual") as GameType,
    mode: (str(formData, "mode") || "offline") as Mode,
    defaultTeamSize: num(formData, "defaultTeamSize") ?? 0,
    coverImage: str(formData, "coverImage") || null,
    rules: str(formData, "rules") || "[]",
    componentKey: str(formData, "componentKey"),
  });

  revalidatePath("/games");
  revalidatePath("/admin");
  redirect(`/admin/games/${id}`);
}

export async function updateGameAction(formData: FormData) {
  await assertAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("Game id missing.");

  await db
    .update(games)
    .set({
      title: str(formData, "title"),
      description: str(formData, "description"),
      type: (str(formData, "type") || "individual") as GameType,
      mode: (str(formData, "mode") || "offline") as Mode,
      defaultTeamSize: num(formData, "defaultTeamSize") ?? 0,
      coverImage: str(formData, "coverImage") || null,
      rules: str(formData, "rules") || "[]",
      componentKey: str(formData, "componentKey"),
    })
    .where(eq(games.id, id));

  revalidatePath("/games");
  revalidatePath(`/games/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/games/${id}`);
}

export async function deleteGameAction(formData: FormData) {
  await assertAdmin();
  const id = str(formData, "id");
  await db.delete(games).where(eq(games.id, id));
  revalidatePath("/games");
  revalidatePath("/admin");
  redirect("/admin");
}

/* ---------- EVENT <-> GAME link actions ---------- */

export async function linkGameToEventAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  if (!eventId || !gameId) throw new Error("Event and game are required.");

  // ignore if the pair already exists
  const existing = await db
    .select()
    .from(eventGames)
    .where(and(eq(eventGames.eventId, eventId), eq(eventGames.gameId, gameId)));
  if (existing.length === 0) {
    await db.insert(eventGames).values({
      eventId,
      gameId,
      sortOrder: num(formData, "sortOrder") ?? 0,
      note: str(formData, "note"),
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

export async function unlinkGameFromEventAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  await db
    .delete(eventGames)
    .where(and(eq(eventGames.eventId, eventId), eq(eventGames.gameId, gameId)));
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

/* ---------- PARTICIPATION actions ---------- */

export async function addParticipationAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  const participantName = str(formData, "participantName");
  if (!eventId || !gameId || !participantName) {
    throw new Error("Event, game and participant name are required.");
  }

  await db.insert(participations).values({
    eventId,
    gameId,
    participantName,
    participantWiki: str(formData, "participantWiki") || null,
    contactEmail: str(formData, "contactEmail")
      ? str(formData, "contactEmail").toLowerCase()
      : null,
    contactPhone: str(formData, "contactPhone")
      ? str(formData, "contactPhone").replace(/\D/g, "")
      : null,
    teamName: str(formData, "teamName") || null,
    role: (str(formData, "role") || "player") as ParticipantRole,
    score: num(formData, "score"),
    rank: num(formData, "rank"),
    isWinner: str(formData, "isWinner") === "on",
  });

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/events/${eventId}`);
}

export async function updateParticipationAction(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  if (id == null) throw new Error("Participation id missing.");

  await db
    .update(participations)
    .set({
      participantName: str(formData, "participantName"),
      participantWiki: str(formData, "participantWiki") || null,
      contactEmail: str(formData, "contactEmail")
        ? str(formData, "contactEmail").toLowerCase()
        : null,
      contactPhone: str(formData, "contactPhone")
        ? str(formData, "contactPhone").replace(/\D/g, "")
        : null,
      teamName: str(formData, "teamName") || null,
      role: (str(formData, "role") || "player") as ParticipantRole,
      score: num(formData, "score"),
      rank: num(formData, "rank"),
      isWinner: str(formData, "isWinner") === "on",
    })
    .where(eq(participations.id, id));

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
}

export async function deleteParticipationAction(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  if (id != null) {
    await db.delete(participations).where(eq(participations.id, id));
  }
  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/events/${eventId}`);
}

/**
 * Bulk import from pasted text. One participant per line.
 * Format (CSV-ish, flexible): name, wiki, team, score
 *   - only name is required
 *   - "wiki", "team" may be left empty:  "Aarav,,Team Falcon,80"
 * Lines starting with # are ignored.
 */
export async function bulkImportParticipationsAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  const raw = str(formData, "bulk");
  if (!eventId || !gameId || !raw) {
    throw new Error("Event, game and pasted rows are required.");
  }

  const rows = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      const [name, wiki, team, scoreStr] = parts;
      const score = scoreStr ? Number(scoreStr) : null;
      return {
        eventId,
        gameId,
        participantName: name,
        participantWiki: wiki || null,
        teamName: team || null,
        role: "player" as ParticipantRole,
        score: score != null && Number.isFinite(score) ? score : null,
        rank: null,
        isWinner: false,
      };
    })
    .filter((r) => r.participantName);

  if (rows.length > 0) {
    await db.insert(participations).values(rows);
  }

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/events/${eventId}`);
}

/**
 * Auto-rank an individual game by score (desc). Highest score = rank 1.
 * Optionally marks the top entry (or all tied for top) as winner.
 * For team games this ranks individuals; team standings are computed in the UI
 * from team totals, so auto-rank is most useful for individual games.
 */
export async function autoRankAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  const markWinner = str(formData, "markWinner") === "on";

  const rows = await db
    .select()
    .from(participations)
    .where(
      and(
        eq(participations.eventId, eventId),
        eq(participations.gameId, gameId),
      ),
    );

  // sort by score desc, nulls last
  const sorted = [...rows].sort(
    (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
  );

  const topScore = sorted.length ? sorted[0].score : null;

  let currentRank = 0;
  let lastScore: number | null = Number.NaN as unknown as number;
  let seen = 0;
  for (const row of sorted) {
    seen += 1;
    // standard competition ranking (ties share a rank)
    if (row.score !== lastScore) {
      currentRank = seen;
      lastScore = row.score;
    }
    const isWinner = markWinner && topScore != null && row.score === topScore;
    await db
      .update(participations)
      .set({ rank: row.score == null ? null : currentRank, isWinner })
      .where(eq(participations.id, row.id));
  }

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
}

/**
 * Mark / unmark a whole team as winner (team games).
 */
export async function setTeamWinnerAction(formData: FormData) {
  await assertAdmin();
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  const teamName = str(formData, "teamName");
  const makeWinner = str(formData, "makeWinner") === "true";

  const rows = await db
    .select()
    .from(participations)
    .where(
      and(
        eq(participations.eventId, eventId),
        eq(participations.gameId, gameId),
      ),
    );

  for (const row of rows) {
    if (row.teamName === teamName) {
      await db
        .update(participations)
        .set({ isWinner: makeWinner })
        .where(eq(participations.id, row.id));
    }
  }

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
}

/* ---------- REGISTRATION actions ---------- */

/**
 * PUBLIC: submit a join application. No admin auth (intentionally open).
 * Basic validation only; lands as status "pending".
 */
export async function registerForEventAction(formData: FormData) {
  const eventId = str(formData, "eventId");
  const name = str(formData, "name");
  const email = str(formData, "email");
  if (!eventId || !name || !email) {
    redirect(`/events/${eventId}?reg=error`);
  }
  // very light email sanity check
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    redirect(`/events/${eventId}?reg=bademail`);
  }

  const gameId = str(formData, "gameId");
  const phoneRaw = str(formData, "phone");

  await db.insert(registrations).values({
    eventId,
    gameId: gameId || null,
    name,
    // store email lowercased so play-time matching is consistent
    email: email.trim().toLowerCase(),
    phone: phoneRaw ? phoneRaw.replace(/\D/g, "") : null,
    wikiHandle: str(formData, "wikiHandle") || null,
    message: str(formData, "message"),
    teamPreference: str(formData, "teamPreference") || null,
    status: "pending",
  });

  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/events/${eventId}?reg=ok`);
}

/** ADMIN: approve / reject / reset a registration. */
export async function setRegistrationStatusAction(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const eventId = str(formData, "eventId");
  const status = str(formData, "status") as RegistrationStatus;
  if (id == null) throw new Error("Registration id missing.");
  if (!["pending", "selected", "rejected"].includes(status)) {
    throw new Error("Invalid status.");
  }

  await db
    .update(registrations)
    .set({
      status,
      reviewedAt: status === "pending" ? null : new Date(),
    })
    .where(eq(registrations.id, id));

  // AUTO-ROSTER: when a member is selected, add them to the relevant game
  // roster(s) automatically. If they applied for a specific game, add to that
  // one; otherwise add to every game linked to the event. Team games get the
  // person with no team assigned (admin forms teams separately).
  if (status === "selected") {
    const [reg] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id));
    if (reg) {
      // which games to add them to
      let targetGameIds: string[];
      if (reg.gameId) {
        targetGameIds = [reg.gameId];
      } else {
        const links = await db
          .select({ gameId: eventGames.gameId })
          .from(eventGames)
          .where(eq(eventGames.eventId, eventId));
        targetGameIds = links.map((l) => l.gameId);
      }

      for (const gameId of targetGameIds) {
        // skip if this person is already on this game's roster
        const existing = await db
          .select()
          .from(participations)
          .where(
            and(
              eq(participations.eventId, eventId),
              eq(participations.gameId, gameId),
              eq(participations.participantName, reg.name),
            ),
          );
        if (existing.length === 0) {
          await db.insert(participations).values({
            eventId,
            gameId,
            participantName: reg.name,
            participantWiki: reg.wikiHandle ?? null,
            contactEmail: reg.email ?? null,
            contactPhone: reg.phone ?? null,
            teamName: null, // admin forms teams later for team games
            role: "player",
            score: null,
            rank: null,
            isWinner: false,
          });
        } else {
          // backfill contact on an existing roster row if it was added manually
          const row = existing[0];
          if (!row.contactEmail && !row.contactPhone) {
            await db
              .update(participations)
              .set({
                contactEmail: reg.email ?? null,
                contactPhone: reg.phone ?? null,
              })
              .where(eq(participations.id, row.id));
          }
        }
      }
    }
  }

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

/** ADMIN: delete a registration entirely. */
export async function deleteRegistrationAction(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const eventId = str(formData, "eventId");
  if (id != null) {
    await db.delete(registrations).where(eq(registrations.id, id));
  }
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

/**
 * ADMIN: assign (or clear) the team of a single participation row.
 * Used by the team builder to organise selected members into teams for
 * team games. Pass empty teamName to unassign.
 */
export async function assignTeamAction(formData: FormData) {
  await assertAdmin();
  const id = num(formData, "id");
  const eventId = str(formData, "eventId");
  const gameId = str(formData, "gameId");
  const teamName = str(formData, "teamName");
  const role = (str(formData, "role") || "player") as ParticipantRole;
  if (id == null) throw new Error("Participation id missing.");

  await db
    .update(participations)
    .set({ teamName: teamName || null, role })
    .where(eq(participations.id, id));

  revalidatePath(`/games/${gameId}/${eventId}`);
  revalidatePath(`/admin/participations/${gameId}/${eventId}`);
  revalidatePath(`/games/${gameId}`);
}

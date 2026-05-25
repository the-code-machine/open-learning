import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, events, participations, eventGames } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { normalizeContact, phoneMatchKey } from "@/lib/contact";

/**
 * POST /api/score
 * Body: { gameId, eventId, contact, score }
 *   - contact: the player's email OR phone (as registered)
 *   - score: final number computed by the game component
 *
 * STRICT IDENTITY: a score is recorded ONLY if the contact matches the
 * email/phone of a participant the admin already SELECTED for this game+event.
 * The API never creates new roster rows — if the contact isn't on the roster,
 * the submission is rejected. This is what stops impersonation: identity comes
 * from a private contact (email/phone, not public, strangers don't know each
 * other's), not from a typed name.
 *
 * The GAME COMPONENT owns all logic and computes the score; this endpoint does
 * not cap or re-check game rules. Replaying to beat your own score is allowed
 * (best score wins) — that is intended for these games.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const gameId = String(body.gameId ?? "").trim();
  const eventId = String(body.eventId ?? "").trim();
  const contactRaw = String(body.contact ?? "").trim();
  const rawScore = Number(body.score);

  if (!gameId || !eventId || !contactRaw) {
    return NextResponse.json(
      { error: "gameId, eventId and contact are required." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(rawScore) || rawScore < 0) {
    return NextResponse.json(
      { error: "score must be a non-negative number." },
      { status: 400 },
    );
  }

  const contact = normalizeContact(contactRaw);
  if (!contact) {
    return NextResponse.json(
      { error: "Enter a valid email or phone number." },
      { status: 400 },
    );
  }

  // game + event must exist and be linked
  const [game] = await db.select().from(games).where(eq(games.id, gameId));
  if (!game) {
    return NextResponse.json({ error: "Unknown game." }, { status: 404 });
  }
  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) {
    return NextResponse.json({ error: "Unknown event." }, { status: 404 });
  }
  const [link] = await db
    .select()
    .from(eventGames)
    .where(and(eq(eventGames.eventId, eventId), eq(eventGames.gameId, gameId)));
  if (!link) {
    return NextResponse.json(
      { error: "This game is not part of that event." },
      { status: 400 },
    );
  }

  // find the SELECTED roster row whose contact matches
  const rosterRows = await db
    .select()
    .from(participations)
    .where(
      and(
        eq(participations.eventId, eventId),
        eq(participations.gameId, gameId),
      ),
    );

  const match = rosterRows.find((r) =>
    contact.kind === "email"
      ? (r.contactEmail ?? "").toLowerCase() === contact.value
      : phoneMatchKey(r.contactPhone ?? "") === phoneMatchKey(contact.value),
  );

  if (!match) {
    return NextResponse.json(
      {
        error:
          "This email or phone is not on the selected roster for this game. Only selected participants can record a score.",
      },
      { status: 403 },
    );
  }

  // component reports the final score; record as-is (rounded), best score wins
  const score = Math.round(rawScore);
  const updated = (match.score ?? -1) < score;
  if (updated) {
    await db
      .update(participations)
      .set({ score })
      .where(eq(participations.id, match.id));
  }

  return NextResponse.json({
    ok: true,
    participationId: match.id,
    participantName: match.participantName,
    recordedScore: Math.max(match.score ?? 0, score),
    updated,
  });
}

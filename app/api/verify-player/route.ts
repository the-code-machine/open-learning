import { NextResponse } from "next/server";
import { db } from "@/db";
import { participations, eventGames } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { normalizeContact, phoneMatchKey } from "@/lib/contact";

/**
 * POST /api/verify-player
 * Body: { gameId, eventId, contact }
 *
 * Read-only identity check used before play starts. Returns the matched
 * selected participant's display info if the contact (email/phone) is on the
 * roster for this game+event, otherwise 403. Records nothing.
 *
 * Note: this confirms the contact is on the selected roster. It does not send a
 * verification code, so it proves "knows the registered contact" rather than
 * "controls it" — sufficient here because contacts are private among strangers.
 * Upgrading to true control-of-contact would require an OTP/email step.
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

  if (!gameId || !eventId || !contactRaw) {
    return NextResponse.json(
      { error: "gameId, eventId and contact are required." },
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
          "This email or phone is not on the selected roster for this game. Only selected participants can play.",
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ok: true,
    participantName: match.participantName,
    participantWiki: match.participantWiki,
    teamName: match.teamName,
  });
}

/**
 * Participant data accessor and wikitext generator.
 *
 * Data lives in /data/participants.json — keyed by event ID, then by a
 * participant slug. The Create Meta Page modal looks up the selected
 * participant here and renders their personalized wikitext.
 *
 * To add another event later: append a new top-level key to participants.json
 * with the same shape. The modal will pick it up via the eventId prop.
 */
import participantsData from "@/data/participants.json";

export interface Participant {
  fullName: string;
  /** Bare Commons filename (no "File:" prefix, no thumb path). */
  commonsImage: string;
  city: string;
  gender: string;
  school: string;
  ageGroup: string;
  usesWikipedia: string;
  editsWikipedia: string;
  hasAccount: string;
  wikiUsername: string;
  interests: string[];
  reason: string;
}

export interface EventData {
  eventTitle: string;
  /** Meta-Wiki short link target, e.g. "m:Wiki Open Learning/Events/..." */
  eventMetaLink: string;
  eventShortName: string;
  eventDate: string;
  /** Commons filename used in the {{userbox}} top-right icon. */
  eventBannerCommonsFile: string;
  participants: Record<string, Participant>;
}

// The JSON file is typed loosely (imported as JSON), so we narrow here.
const DATA = participantsData as Record<string, EventData>;

/** Returns the event data block if we have participants for that event id. */
export function getEventParticipants(eventId: string): EventData | null {
  return DATA[eventId] ?? null;
}

/** Returns a sorted list of { slug, fullName } for the dropdown. */
export function listParticipants(
  eventId: string,
): Array<{ slug: string; fullName: string }> {
  const data = DATA[eventId];
  if (!data) return [];
  return Object.entries(data.participants)
    .map(([slug, p]) => ({ slug, fullName: p.fullName }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/** Looks up one participant. */
export function getParticipant(
  eventId: string,
  slug: string,
): Participant | null {
  return DATA[eventId]?.participants[slug] ?? null;
}

/**
 * Build a personalized Meta-Wiki user page in wikitext, following the
 * reference layout the user gave us (userboxes top-right, About me with
 * float-right photo, interests bullets, work history, contact, UTC).
 *
 * Falls back to a clean generic page when the participant has no entry in
 * the data file (walk-in attendees) — we still need the Wiki username from
 * the input form to build the URL, so override.wikiUsername is required.
 */
export function buildMetaWikitext(opts: {
  event: EventData;
  participant: Participant | null;
  /** Required override — used when participant.wikiUsername is empty. */
  username: string;
  /** Optional name override (walk-in case). */
  fallbackName?: string;
  /** Optional city override (walk-in case). */
  fallbackCity?: string;
}): string {
  const { event, participant, username } = opts;
  const fullName = participant?.fullName ?? opts.fallbackName ?? "Your Name";
  const city = participant?.city ?? opts.fallbackCity ?? "";
  const school = participant?.school ?? "";
  const photo = participant?.commonsImage ?? "";
  const interests = (participant?.interests ?? []).slice(0, 6);

  const lines: string[] = [];

  lines.push(
    "<!-- This page was started with the Wiki Open Learning create-your-page tool. -->",
    '<!-- Edit anything below to make it your own, then click "Publish changes". -->',
    "",
  );

  // Userboxes — WOL membership + event participation
  lines.push("{{User WOL}}");
  lines.push("{{userbox");
  lines.push(`|id=[[File:${event.eventBannerCommonsFile}|60px]]`);
  lines.push(
    `|info=This user participated in the '''[[${event.eventMetaLink}|${event.eventShortName}]]'''.`,
  );
  lines.push("}}");
  lines.push("----");
  lines.push("");

  // About me — with float-right photo if we have one
  lines.push("== About me ==");
  if (photo) {
    lines.push('<div style="float:right; margin-left:15px;">');
    lines.push(`[[File:${photo}|250px]]`);
    lines.push("</div>");
  }
  const cityPhrase = city ? ` from '''${capitalizeCity(city)}''', India` : "";
  lines.push(`Hello! I am '''${fullName}'''${cityPhrase}.`);
  if (school) {
    lines.push(
      `I am a student of '''${school}''' and a '''member of the [[m:Wiki Open Learning|Wiki Open Learning]]'''.`,
    );
  } else {
    lines.push(
      "I am a '''member of the [[m:Wiki Open Learning|Wiki Open Learning]]'''.",
    );
  }
  lines.push("");

  if (interests.length > 0) {
    lines.push("I am interested in:");
    for (const interest of interests) {
      lines.push(`* ${interest}`);
    }
    lines.push("");
  }

  lines.push(
    "I enjoy learning new things and expanding my understanding through collaborative platforms like Wikimedia.",
  );
  lines.push("");

  // My work — generic onboarding language with event reference
  lines.push("== My work ==");
  lines.push(
    `I started my journey with Wikimedia projects in 2026 through the ${event.eventShortName} event.`,
  );
  lines.push("");
  lines.push("I am currently learning:");
  lines.push("* Basics of Wikipedia editing");
  lines.push("* Understanding reliable information and sources");
  lines.push("* Exploring how knowledge is shared globally");
  lines.push("");
  lines.push(
    "I am excited to continue learning and contribute meaningfully in the future.",
  );
  lines.push("");
  lines.push("----");
  lines.push("");

  // Contact
  lines.push("== Contact ==");
  lines.push("* [[Special:MyTalk|My talk page]]");
  lines.push("");
  lines.push("{{User UTC|+5:30}}");
  lines.push("");
  lines.push("[[Category:Wiki Open Learning members]]");

  void username; // intentionally unused in body — username goes in the URL
  return lines.join("\n");
}

/** "vidisha" -> "Vidisha"; leaves things like "New York" alone. */
function capitalizeCity(city: string): string {
  return city
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

/**
 * Build the full Meta-Wiki edit URL. Uses `text=` (not `preload=`) so the
 * prefilled wikitext appears even if the user already has a user page.
 */
export function buildMetaEditUrl(username: string, wikitext: string): string {
  const summary = "Created my user page with the Wiki Open Learning tool";
  return (
    `https://meta.wikimedia.org/w/index.php` +
    `?title=User:${encodeURIComponent(username)}` +
    `&action=edit` +
    `&summary=${encodeURIComponent(summary)}` +
    `&text=${encodeURIComponent(wikitext)}`
  );
}

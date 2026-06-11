/**
 * Participant data accessor and wikitext generator.
 *
 * Data lives in /data/participants.json — keyed by event ID, then by a
 * participant slug.
 */
import participantsData from "@/data/participants.json";

export interface Participant {
  fullName: string;
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
  eventMetaLink: string;
  eventShortName: string;
  eventDate: string;
  eventBannerCommonsFile: string;
  participants: Record<string, Participant>;
}

const DATA = participantsData as Record<string, EventData>;

/* List of "no real username" values we should treat as empty so they don't
   auto-fill the input field with garbage. Match case-insensitively. */
const INVALID_USERNAMES = new Set([
  "",
  "no",
  "n/a",
  "na",
  "none",
  "don't remember",
  "dont remember",
  "do not remember",
  "not sure",
  "yes",
]);

function cleanUsername(raw: string | undefined): string {
  if (!raw) return "";
  const v = raw.trim();
  if (INVALID_USERNAMES.has(v.toLowerCase())) return "";
  return v;
}

export function getEventParticipants(eventId: string): EventData | null {
  return DATA[eventId] ?? null;
}

export function listParticipants(
  eventId: string,
): Array<{ slug: string; fullName: string }> {
  const data = DATA[eventId];
  if (!data) return [];
  return Object.entries(data.participants)
    .map(([slug, p]) => ({ slug, fullName: p.fullName }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function getParticipant(
  eventId: string,
  slug: string,
): Participant | null {
  const p = DATA[eventId]?.participants[slug] ?? null;
  if (!p) return p;
  // Normalize the username field so non-answers don't pollute the form
  return { ...p, wikiUsername: cleanUsername(p.wikiUsername) };
}

/**
 * Build Meta-Wiki user-page wikitext.
 *
 * Layout matches the user-provided reference exactly:
 *   - Right sidebar (260px float): photo, then {{User WOL}}, then {{userbox}}
 *     for the event participation, then {{User UTC}}.
 *   - Main body: "== About me ==" with personalized intro and interests bullets.
 *   - "== My work ==" with onboarding bullets.
 *   - "== Contact ==" with talk page link.
 *   - [[Category:Wikipedians in India]] at the end.
 *
 * No welcome strip, no color badges, no extra framing. Plain Meta-Wiki.
 */
export function buildMetaWikitext(opts: {
  event: EventData;
  participant: Participant | null;
  username: string;
  fallbackName?: string;
  fallbackCity?: string;
}): string {
  const { event, participant } = opts;
  const fullName = participant?.fullName ?? opts.fallbackName ?? "Your Name";
  const city = participant?.city ?? opts.fallbackCity ?? "";
  const school = participant?.school ?? "";
  const photo = participant?.commonsImage ?? "";
  const interests = (participant?.interests ?? []).slice(0, 6);
  const cityCap = city ? capitalizeCity(city) : "";

  const lines: string[] = [];

  /* RIGHT SIDEBAR: photo + userboxes + UTC timezone, all in one container */
  lines.push('<div style="float:right; width:260px; margin:0 0 15px 20px;">');
  if (photo) {
    lines.push(`[[File:${photo}|250px]]`);
  }
  lines.push("{{User WOL}}");
  lines.push("{{userbox");
  lines.push(`|id=[[File:${event.eventBannerCommonsFile}|60px]]`);
  lines.push(
    `|info=This user participated in the '''[[${event.eventMetaLink}|${event.eventShortName}]]'''.`,
  );
  lines.push("}}");
  lines.push("{{User UTC|+5:30}}");
  lines.push("</div>");

  /* ABOUT ME */
  lines.push("== About me ==");
  lines.push(
    `Hello! I am '''${fullName}'''${cityCap ? ` from ${cityCap}, India` : ""}.`,
  );
  if (school) {
    lines.push(
      `I am a student at '''${school}''' and a '''member of [[m:Wiki Open Learning|Wiki Open Learning]]'''.`,
    );
  } else {
    lines.push(
      "I am a '''member of [[m:Wiki Open Learning|Wiki Open Learning]]'''.",
    );
  }

  if (interests.length > 0) {
    lines.push("I am interested in:");
    for (const interest of interests) lines.push(`* ${interest}`);
  }

  lines.push(
    "I believe knowledge should be free and accessible to everyone, and I want to be part of building it.",
  );

  /* MY WORK */
  lines.push("== My work ==");
  lines.push(
    `I began my Wikimedia journey in 2026 at the ${event.eventShortName}.`,
  );
  lines.push("I am currently learning:");
  lines.push("* The basics of Wikipedia editing");
  lines.push("* How to find and cite reliable sources");
  lines.push("* How a global community builds free knowledge together");
  lines.push(
    "I am looking forward to making my first meaningful contributions.",
  );

  /* CONTACT */
  lines.push("== Contact ==");
  lines.push("* [[Special:MyTalk|My talk page]]");

  /* CATEGORY */
  lines.push("[[Category:Wikipedians in India]]");

  return lines.join("\n");
}

function capitalizeCity(city: string): string {
  return city
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

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

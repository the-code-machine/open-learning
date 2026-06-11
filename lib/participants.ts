/**
 * Participant data accessor and wikitext generator.
 *
 * Data lives in /data/participants.json — keyed by event ID, then by a
 * participant slug.
 *
 * To add another event later: append a new top-level key to participants.json
 * with the same shape. The modal will pick it up via the eventId prop.
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
  return DATA[eventId]?.participants[slug] ?? null;
}

/**
 * REDESIGNED wikitext layout (v3).
 *
 * Constraints we're working within (MediaWiki):
 *   - Inline styles only (no <style> blocks, no external CSS classes)
 *   - {{userbox}} template renders its own table — we can wrap it but not
 *     restyle its internals
 *   - Float-right sidebar is the only multi-column option
 *
 * What we improved:
 *   1. Welcome strip at top — name, city, role — with a 4px Wikimedia-blue
 *      left accent and very light blue background tint. Acts as a hero strip.
 *   2. Right sidebar: photo (avatar style, 200px, soft border) + userboxes
 *      grouped into ONE 260px container so they can't drift apart.
 *   3. About me, Interests, My work, Contact — same wikitext sections, but
 *      they now wrap properly around the consolidated sidebar.
 *   4. Footer pills — small inline badges noting "Member of WOL" and
 *      "Wikipedia 25 participant" using styled spans (Meta-Wiki allows
 *      inline background-color on spans).
 *
 * Colors used (sparingly, all Wikimedia-canonical):
 *   - #3366cc — Wikimedia link blue, used for accent bar and badge text
 *   - #e6f0ff — very light tint for the welcome strip background
 *   - #f8f9fa — Meta's own soft gray, used for section backgrounds
 *   - #a2a9b1 — Meta's standard border gray
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

  lines.push(
    "<!-- Started with the Wiki Open Learning create-your-page tool. Edit anything below, then click Publish. -->",
    "",
  );

  /* -----------------------------------------------------------------------
   * RIGHT SIDEBAR — one container holds photo + userboxes so they stay
   * together. clear:right means nothing else floats next to it.
   * --------------------------------------------------------------------- */
  lines.push(
    '<div style="float:right; clear:right; width:260px; margin:0 0 1.5em 1.5em;">',
  );
  // Photo card — avatar at top of sidebar, framed with subtle border
  if (photo) {
    lines.push(
      '<div style="border:1px solid #a2a9b1; background:#f8f9fa; padding:6px; margin-bottom:8px; text-align:center;">',
    );
    lines.push(`[[File:${photo}|240px]]`);
    lines.push(
      '<div style="font-size:11px; color:#54595d; padding:4px 0 2px; line-height:1.3;">',
    );
    lines.push(`'''${fullName}'''${cityCap ? `<br/>${cityCap}, India` : ""}`);
    lines.push("</div>");
    lines.push("</div>");
  }
  // Userboxes block — stays directly below photo, no gap
  lines.push("{{User WOL}}");
  lines.push("{{userbox");
  lines.push(`|id=[[File:${event.eventBannerCommonsFile}|60px]]`);
  lines.push(
    `|info=Participated in the '''[[${event.eventMetaLink}|${event.eventShortName}]]''' on ${event.eventDate}.`,
  );
  lines.push("}}");
  lines.push("</div>");
  lines.push("");

  /* -----------------------------------------------------------------------
   * WELCOME STRIP — name + role banner at top with blue accent
   * --------------------------------------------------------------------- */
  lines.push(
    '<div style="background:#e6f0ff; border-left:4px solid #3366cc; padding:10px 14px; margin:0 0 1em 0;">',
  );
  lines.push(
    `<div style="font-size:1.4em; font-weight:bold; color:#202122; line-height:1.3;">${fullName}</div>`,
  );
  const subParts: string[] = [];
  if (cityCap) subParts.push(`From ${cityCap}, India`);
  if (school) subParts.push(school);
  subParts.push("Member of [[m:Wiki Open Learning|Wiki Open Learning]]");
  lines.push(
    `<div style="font-size:0.95em; color:#54595d; margin-top:3px;">${subParts.join(" · ")}</div>`,
  );
  lines.push("</div>");
  lines.push("");

  /* -----------------------------------------------------------------------
   * ABOUT ME
   * --------------------------------------------------------------------- */
  lines.push("== About me ==");
  lines.push(
    `Hello! I am '''${fullName}'''${cityCap ? ` from '''${cityCap}''', India` : ""}.`,
  );
  if (school) {
    lines.push(
      `I am a student of '''${school}''' and a member of the [[m:Wiki Open Learning|Wiki Open Learning]] community.`,
    );
  } else {
    lines.push(
      "I am a member of the [[m:Wiki Open Learning|Wiki Open Learning]] community.",
    );
  }
  lines.push("");

  if (interests.length > 0) {
    lines.push("I am interested in:");
    for (const interest of interests) lines.push(`* ${interest}`);
    lines.push("");
  }

  lines.push(
    "I enjoy learning new things and expanding my understanding through collaborative platforms like Wikimedia.",
  );
  lines.push("");

  /* -----------------------------------------------------------------------
   * MY WORK — clearfix so it doesn't wrap around the sidebar
   * --------------------------------------------------------------------- */
  lines.push('<div style="clear:both;"></div>');
  lines.push("");
  lines.push("== My work ==");
  lines.push(
    `I started my journey with Wikimedia projects in 2026 through the '''${event.eventShortName}''' event.`,
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

  /* -----------------------------------------------------------------------
   * CONTACT — softer box around it
   * --------------------------------------------------------------------- */
  lines.push("== Contact ==");
  lines.push(
    '<div style="background:#f8f9fa; border:1px solid #eaecf0; padding:8px 14px; margin:0.3em 0;">',
  );
  lines.push("* [[Special:MyTalk|My talk page]]");
  lines.push("</div>");
  lines.push("");
  lines.push("{{User UTC|+5:30}}");
  lines.push("");

  /* -----------------------------------------------------------------------
   * FOOTER PILLS — subtle inline badges
   * --------------------------------------------------------------------- */
  lines.push("----");
  lines.push(
    '<div style="font-size:0.85em; color:#54595d; margin-top:0.8em;">',
  );

  lines.push("</div>");
  lines.push("");
  lines.push("[[Category:Wiki Open Learning members]]");

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

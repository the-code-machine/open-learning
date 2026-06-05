/**
 * Seed script — RESTORE from the 2026-06 backup, plus the new Wiki25 game.
 *
 * Run with:  npm run db:seed
 *
 * Safe to re-run: it clears the four tables first, then inserts.
 *
 * IMPORTANT: This file faithfully recreates the production state captured in
 * the JSON backup (events, registrations, participations) and adds the new
 * "Wiki 25 Story Builder" game. Game IDs match the IDs your live event-link
 * and participation rows already reference (citation-needed,
 * real-or-fake-wikipedia-edition). Old seed-only games from the previous
 * seed (wiki-quiz, edit-a-thon, etc.) are NOT included — none of your real
 * data references them.
 */
import "dotenv/config";
import { db } from "@/db";
import {
  events,
  games,
  eventGames,
  participations,
  registrations,
} from "@/db/schema";

async function seed() {
  console.log("Clearing existing data...");
  // order matters: dependents first
  await db.delete(participations);
  await db.delete(registrations);
  await db.delete(eventGames);
  await db.delete(games);
  await db.delete(events);

  /* ---------------- GAMES ---------------- */
  console.log("Inserting games...");
  await db.insert(games).values([
    {
      id: "citation-needed",
      title: "Citation Needed?",
      description:
        "Ten statements appear one at a time, each written like a line from a Wikipedia article. Some are specific, surprising, or contested claims that an editor would flag for a source. Others are common knowledge or self-evident. You get ten seconds per statement to make the call: citation needed, or fine as is? Watch the classic blue [citation needed] tag pop up when you're right.",
      type: "individual",
      mode: "offline",
      defaultTeamSize: 0,
      coverImage: null,
      rules: JSON.stringify([
        { label: "Format", detail: "10 statements, 10 seconds each." },
        {
          label: "Scoring",
          detail: "1 point per correct call for 10 possible",
        },
        {
          label: "Penalty",
          detail: "no points for wrong or timed-out answers",
        },
        {
          label: "Tiebreaker",
          detail: "faster correct calls rank higher when scores tie.",
        },
      ]),
      componentKey: "citation-needed-v1",
      maxScore: 0,
      config: "{}",
      createdAt: new Date(1779725184 * 1000),
    },
    {
      id: "real-or-fake-wikipedia-edition",
      title: "Real or Fake: Wikipedia Edition",
      description:
        'Ten Wikipedia article titles flash up one at a time. Some are genuine articles that really exist (yes, "Death by coconut" is real), and some we invented. You get ten seconds per title to decide: real or fake. One point per correct answer, but answer fast, because speed is the tiebreaker.',
      type: "individual",
      mode: "offline",
      defaultTeamSize: 0,
      coverImage: null,
      rules: JSON.stringify([
        { label: "Format", detail: "10 questions, 10 seconds each" },
        {
          label: "Scoring",
          detail: "1 point per correct answer for 10 possible",
        },
        {
          label: "Penalty",
          detail: "no points for wrong or timed-out answers",
        },
        {
          label: "Tiebreaker",
          detail: "faster correct answers rank higher when scores tie",
        },
      ]),
      componentKey: "real-or-fake-v1",
      maxScore: 0,
      config: "{}",
      createdAt: new Date(1779723785 * 1000),
    },
    {
      id: "wiki-25-story-builder",
      title: "Wiki 25 Story Builder",
      description:
        "A team creative-writing game built for the Wikipedia 25 celebration. Players get 25 elements — characters, settings, objects, actions, and twists, each worth one to five points based on difficulty. They have eight minutes to weave as many as they can into a logically coherent story of at least 150 words. The more elements used, the higher the score. Copy-pasting is blocked, so teams must write in real time.",
      type: "team",
      mode: "offline",
      defaultTeamSize: 5,
      coverImage: null,
      rules: JSON.stringify([
        {
          label: "Format",
          detail:
            "8 minutes total, one writer per team, story typed live (paste blocked). ",
        },
        {
          label: "Length",
          detail: "150 words minimum to submit; below that scores zero.",
        },
        {
          label: "Scoring",
          detail:
            "element points (1–5 each based on difficulty) dominate the score; length bonus (+20 at 150 words, +40 at 200, +80 at 300); small speed bonus only as a tiebreaker.",
        },
        {
          label: "Element detection",
          detail:
            "whole-word, case-insensitive, including common plurals and verb forms.",
        },
        {
          label: "Admin",
          detail:
            "reviews the story after submission and can adjust the score if a team gamed the system (the participation manager shows each story).",
        },
      ]),
      componentKey: "wiki25-story-v1",
      maxScore: 0,
      config: "{}",
      createdAt: new Date(1780690217 * 1000),
    },
  ]);

  /* ---------------- EVENTS ---------------- */
  console.log("Inserting events...");
  await db.insert(events).values([
    {
      id: "wiki-birthday",
      title: "Wiki birthdayWikipedia 25 Years Celebration in Vidisha",
      details:
        "Vidisha Celebrates Wikipedia is a one-day community gathering marking the twenty-fifth anniversary of Wikipedia. It is part of a global series of Wikipedia 25 community celebrations taking place across the world through 2026.\r\n\r\nThe day blends short talks, hands-on Wikimedia account creation and first-edit sessions, ice-breakers, team challenges, the Wikipedia 25 cake cutting, and informal networking. Sessions are held in English and Hindi. No prior Wikimedia experience is needed - curiosity is enough.\r\n\r\nFor the complete schedule, venue details, organising team, the Friendly Space Policy, and the participation kit details, please see the main event documentation page on Meta-Wiki.",
      date: "2026-06-07",
      time: "10:30 AM - 06:00 PM",
      mode: "hybrid",
      location: "The Pride Hotel, Vidisha",
      status: "upcoming",
      category: "Birthday Party",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/commons/3/32/Wikipedia_25th_Birthday_Landscape_banner_%281600X400%29_Vidisha.png",
      timeline: JSON.stringify([
        { time: "10:30 - 11:00 AM", title: "Arrival and registration" },
        { time: "11:00 - 11:30 AM", title: "The Welcome Confluence" },
        { time: "11:30 AM - 12:00 PM", title: "Refreshments and networking" },
        {
          time: "12:00 - 12:20 PM",
          title: "Twenty-Five Years in Twenty Minutes",
        },
        { time: "12:20 - 12:45 PM", title: "The Encyclopedia Anyone Can Edit" },
        { time: "12:45 - 1:15 PM", title: "Mosaic of Minds" },
        { time: "1:15 - 2:00 PM\t", title: "Six Tribes, One Encyclopedia" },
        { time: "2:00 - 2:45 PM", title: "Lunch" },
        { time: "2:45 - 3:30 PM", title: "The First Quill" },
        { time: "3:30 - 4:15 PM", title: "Champions of the Commons" },
        { time: "4:15 - 4:45 PM\t", title: "Voices of the Commons" },
        { time: "4:45 - 5:30 PM", title: "The Twenty-Fifth Candle" },
        { time: "5:30 - 6:00 PM", title: "Until We Meet Again" },
      ]),
      facilitators: JSON.stringify([]),
      organisers: JSON.stringify([
        { name: "Dev Jadiya", role: "Organiser" },
        { name: "Sarthak Khare", role: "Organiser" },
      ]),
      createdAt: new Date(1779723952 * 1000),
    },
    {
      id: "wiki-for-students-in-india-workshop-01",
      title: "Wiki for Students in India Workshop 01",
      details:
        "Wiki for Students in India - Workshop #01 was the first learning activity conducted under the Wiki Open Learning initiative. The workshop focused on introducing school students to Wikipedia, open knowledge, and the idea of open-source contribution. The session aimed to build early awareness among primary and high school students about how free knowledge platforms work and how they can participate responsibly.",
      date: "2025-12-18",
      time: "2pm-3pm",
      mode: "offline",
      location: "Lalitpur, Uttar Pradesh, India",
      status: "past",
      category: "Workshop",
      coverImage:
        "https://upload.wikimedia.org/wikipedia/commons/6/6d/Wiki_for_Students_in_India_Workshop_01_December_01.jpg",
      timeline: JSON.stringify([]),
      facilitators: JSON.stringify([
        { name: "Vaishnavi Shrivastava", role: "Trainee", wiki: "Aein_19" },
      ]),
      organisers: JSON.stringify([
        { name: "Sarthak Khare", role: "Organiser" },
        { name: "Dev Jadiya", role: "Organiser" },
      ]),
      createdAt: new Date(1779714105 * 1000),
    },
  ]);

  /* ---------------- EVENT-GAME LINKS ---------------- */
  console.log("Linking games to events...");
  await db.insert(eventGames).values([
    {
      eventId: "wiki-birthday",
      gameId: "citation-needed",
      sortOrder: 0,
      note: "",
    },
    {
      eventId: "wiki-birthday",
      gameId: "real-or-fake-wikipedia-edition",
      sortOrder: 0,
      note: "",
    },
  ]);

  /* ---------------- REGISTRATIONS ---------------- */
  // From your registrations.json: Dev Jadiya (selected), plus ONE Anushka
  // Patel pending row (the duplicate id=4 is dropped per your instruction).
  console.log("Inserting registrations...");
  await db.insert(registrations).values([
    {
      eventId: "wiki-birthday",
      gameId: null,
      name: "Dev Jadiya",
      email: "dev.wikipedia@gmail.com",
      phone: "8770278814",
      wikiHandle: "Dev Jadiya",
      message: "I want to join sarthak sir",
      teamPreference: null,
      status: "selected",
      createdAt: new Date(1779725460 * 1000),
      reviewedAt: new Date(1779725551 * 1000),
    },
    {
      eventId: "wiki-birthday",
      gameId: null,
      name: "Anushka Patel",
      email: "niranjanushka10@gmail.com",
      phone: "6267072197",
      wikiHandle: null,
      message: "",
      teamPreference: null,
      status: "pending",
      createdAt: new Date(1780424347 * 1000),
      reviewedAt: null,
    },
  ]);

  /* ---------------- PARTICIPATIONS ---------------- */
  console.log("Inserting participations...");
  await db.insert(participations).values([
    {
      eventId: "wiki-birthday",
      gameId: "citation-needed",
      participantName: "Dev Jadiya",
      participantWiki: "Dev Jadiya",
      contactEmail: "dev.wikipedia@gmail.com",
      contactPhone: "8770278814",
      submissionText: null,
      teamName: null,
      role: "player",
      score: 9127,
      rank: null,
      isWinner: false,
      createdAt: new Date(1779725553 * 1000),
    },
    {
      eventId: "wiki-birthday",
      gameId: "real-or-fake-wikipedia-edition",
      participantName: "Dev Jadiya",
      participantWiki: "Dev Jadiya",
      contactEmail: "dev.wikipedia@gmail.com",
      contactPhone: "8770278814",
      submissionText: null,
      teamName: null,
      role: "player",
      score: 12919,
      rank: null,
      isWinner: false,
      createdAt: new Date(1779725553 * 1000),
    },
  ]);

  console.log("");
  console.log("✓ Restore seed complete.");
  console.log("  Games:          3");
  console.log("  Events:         2");
  console.log("  Event links:    2");
  console.log(
    "  Registrations:  2 (Dev Jadiya selected, Anushka Patel pending)",
  );
  console.log("  Participations: 2 (Dev Jadiya scored on both games)");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

/**
 * Seed script. Run with:  npm run db:seed
 * Safe to re-run: it clears the four tables first, then inserts sample data.
 *
 * Uses tsx (added as a dev dependency) so it runs the TypeScript directly.
 */
import "dotenv/config";
import { db } from "@/db";
import { events, games, eventGames, participations } from "@/db/schema";

async function seed() {
  console.log("Clearing existing data...");
  await db.delete(participations);
  await db.delete(eventGames);
  await db.delete(games);
  await db.delete(events);

  console.log("Inserting games...");
  await db.insert(games).values([
    {
      id: "wiki-quiz",
      title: "Wiki Quiz Bowl",
      description:
        "A rapid-fire quiz on Wikipedia, open knowledge, and the free culture movement. Teams buzz in to answer.",
      type: "team",
      mode: "offline",
      defaultTeamSize: 4,
      rules: JSON.stringify([
        { label: "Rounds", detail: "3 rounds of 10 questions each" },
        { label: "Scoring", detail: "+10 correct, -5 wrong on a buzz" },
      ]),
    },
    {
      id: "edit-a-thon",
      title: "Commons Edit-a-thon",
      description:
        "Individuals race to make the most quality edits and uploads to Wikimedia Commons within the time limit.",
      type: "individual",
      mode: "hybrid",
      defaultTeamSize: 0,
      rules: JSON.stringify([
        { label: "Scoring", detail: "1 point per accepted edit, 5 per upload" },
      ]),
    },
    {
      id: "open-source-sprint",
      title: "Open Source Sprint",
      description:
        "Teams pick a real issue from a partner repo and ship a pull request before the buzzer.",
      type: "team",
      mode: "offline",
      defaultTeamSize: 3,
      rules: JSON.stringify([
        { label: "Judging", detail: "Merged PRs score highest" },
      ]),
    },
    {
      id: "typing-relay",
      title: "Typing Relay",
      description:
        "An individual speed-and-accuracy typing challenge on open-licensed text.",
      type: "individual",
      mode: "online",
      defaultTeamSize: 0,
      rules: JSON.stringify([
        { label: "Scoring", detail: "Net WPM after accuracy penalty" },
      ]),
    },
  ]);

  console.log("Inserting events...");
  await db.insert(events).values([
    {
      id: "wiki-fest-2025",
      title: "Wiki Fest 2025",
      details:
        "Our flagship day of open learning: quizzes, edit-a-thons, and a coding sprint, all in one place.",
      date: "2025-11-02",
      time: "09:00 AM - 6:00 PM",
      mode: "offline",
      location: "City Library Hall, Bhopal",
      status: "past",
      category: "Festival",
      timeline: JSON.stringify([
        { time: "09:00 AM", title: "Check-in and team formation" },
        { time: "10:00 AM", title: "Wiki Quiz Bowl begins" },
        { time: "01:00 PM", title: "Lunch break" },
        { time: "02:00 PM", title: "Open Source Sprint" },
        { time: "05:00 PM", title: "Awards" },
      ]),
      facilitators: JSON.stringify([
        { name: "Sarthak Khare", role: "Tech Lead", wiki: "Status_401" },
        { name: "Dev Jadiya", role: "Infrastructure", wiki: "Dev Jadiya" },
      ]),
      organisers: JSON.stringify([
        { name: "Wiki Open Learning", role: "Host" },
      ]),
    },
    {
      id: "open-learning-meetup-jan",
      title: "Open Learning Meetup",
      details:
        "A lighter community meetup with an online edit-a-thon and a typing relay for newcomers.",
      date: "2026-01-18",
      time: "05:00 PM - 8:00 PM",
      mode: "hybrid",
      location: "Tech Park Wing B + Online",
      status: "past",
      category: "Meetup",
      timeline: JSON.stringify([
        { time: "05:00 PM", title: "Welcome" },
        { time: "05:30 PM", title: "Commons Edit-a-thon" },
        { time: "07:00 PM", title: "Typing Relay" },
      ]),
      facilitators: JSON.stringify([
        { name: "Sarthak Khare", role: "Facilitator", wiki: "Status_401" },
      ]),
      organisers: JSON.stringify([
        { name: "Wiki Open Learning", role: "Host" },
      ]),
    },
    {
      id: "summer-hack-2026",
      title: "Summer Open Hack 2026",
      details:
        "An upcoming hackathon-style event. Games and rosters will be announced closer to the date.",
      date: "2026-06-20",
      time: "10:00 AM - 6:00 PM",
      mode: "offline",
      location: "To be announced",
      status: "upcoming",
      category: "Hackathon",
      timeline: JSON.stringify([]),
      facilitators: JSON.stringify([]),
      organisers: JSON.stringify([
        { name: "Wiki Open Learning", role: "Host" },
      ]),
    },
  ]);

  console.log("Linking games to events...");
  await db.insert(eventGames).values([
    {
      eventId: "wiki-fest-2025",
      gameId: "wiki-quiz",
      sortOrder: 1,
      note: "Morning round",
    },
    {
      eventId: "wiki-fest-2025",
      gameId: "open-source-sprint",
      sortOrder: 2,
      note: "Afternoon",
    },
    {
      eventId: "open-learning-meetup-jan",
      gameId: "edit-a-thon",
      sortOrder: 1,
      note: "",
    },
    {
      eventId: "open-learning-meetup-jan",
      gameId: "typing-relay",
      sortOrder: 2,
      note: "",
    },
    // summer-hack-2026 intentionally has no games yet (upcoming)
  ]);

  console.log("Inserting sample participations...");
  await db.insert(participations).values([
    // Wiki Quiz Bowl @ Wiki Fest — two teams
    {
      eventId: "wiki-fest-2025",
      gameId: "wiki-quiz",
      participantName: "Aarav",
      teamName: "Team Falcon",
      role: "captain",
      score: 85,
      rank: 1,
      isWinner: true,
    },
    {
      eventId: "wiki-fest-2025",
      gameId: "wiki-quiz",
      participantName: "Priya",
      teamName: "Team Falcon",
      role: "player",
      score: 85,
      rank: 1,
      isWinner: true,
    },
    {
      eventId: "wiki-fest-2025",
      gameId: "wiki-quiz",
      participantName: "Rohan",
      teamName: "Team Owl",
      role: "captain",
      score: 70,
      rank: 2,
      isWinner: false,
    },
    {
      eventId: "wiki-fest-2025",
      gameId: "wiki-quiz",
      participantName: "Sara",
      teamName: "Team Owl",
      role: "player",
      score: 70,
      rank: 2,
      isWinner: false,
    },
    // Open Source Sprint @ Wiki Fest
    {
      eventId: "wiki-fest-2025",
      gameId: "open-source-sprint",
      participantName: "Aarav",
      teamName: "Mergers",
      role: "captain",
      score: 3,
      rank: 1,
      isWinner: true,
    },
    {
      eventId: "wiki-fest-2025",
      gameId: "open-source-sprint",
      participantName: "Nikhil",
      teamName: "Mergers",
      role: "player",
      score: 3,
      rank: 1,
      isWinner: true,
    },
    // Edit-a-thon @ Meetup — individuals
    {
      eventId: "open-learning-meetup-jan",
      gameId: "edit-a-thon",
      participantName: "Priya",
      participantWiki: "PriyaEdits",
      role: "player",
      score: 42,
      rank: 1,
      isWinner: true,
    },
    {
      eventId: "open-learning-meetup-jan",
      gameId: "edit-a-thon",
      participantName: "Rohan",
      role: "player",
      score: 31,
      rank: 2,
      isWinner: false,
    },
    {
      eventId: "open-learning-meetup-jan",
      gameId: "edit-a-thon",
      participantName: "Aarav",
      role: "player",
      score: 28,
      rank: 3,
      isWinner: false,
    },
    // Typing Relay @ Meetup — individuals
    {
      eventId: "open-learning-meetup-jan",
      gameId: "typing-relay",
      participantName: "Sara",
      role: "player",
      score: 78,
      rank: 1,
      isWinner: true,
    },
    {
      eventId: "open-learning-meetup-jan",
      gameId: "typing-relay",
      participantName: "Priya",
      role: "player",
      score: 65,
      rank: 2,
      isWinner: false,
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

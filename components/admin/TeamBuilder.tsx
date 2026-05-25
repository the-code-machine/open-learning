"use client";

import { useState } from "react";
import { Users2, Crown, Save } from "lucide-react";
import type { ParticipationModel } from "@/lib/types";
import { assignTeamAction } from "@/lib/actions";

/**
 * Team builder for team games. Lists every rostered participant and lets the
 * admin set each person's team and mark a captain. Writes via assignTeamAction.
 * Players land here automatically when selected (auto-roster); the admin just
 * organises them into teams.
 */
export default function TeamBuilder({
  rows,
  eventId,
  gameId,
}: {
  rows: ParticipationModel[];
  eventId: string;
  gameId: string;
}) {
  // existing team names for quick-pick
  const existingTeams = Array.from(
    new Set(rows.map((r) => r.teamName).filter(Boolean) as string[]),
  );

  const unassigned = rows.filter((r) => !r.teamName);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Users2 size={18} className="text-brand-blue" /> Team builder
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Organise rostered players into teams. Set a team name for each person
        and mark one captain per team.
        {existingTeams.length > 0 && (
          <>
            {" "}
            Current teams:{" "}
            <span className="font-semibold text-gray-700">
              {existingTeams.join(", ")}
            </span>
            .
          </>
        )}
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">
          No players on the roster yet. Players appear here once selected from
          registrations or added manually.
        </p>
      ) : (
        <div className="space-y-2">
          {unassigned.length > 0 && (
            <p className="text-xs font-semibold text-amber-600 mb-1">
              {unassigned.length} unassigned
            </p>
          )}
          {rows.map((r) => (
            <PlayerTeamRow
              key={r.id}
              row={r}
              eventId={eventId}
              gameId={gameId}
              existingTeams={existingTeams}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerTeamRow({
  row,
  eventId,
  gameId,
  existingTeams,
}: {
  row: ParticipationModel;
  eventId: string;
  gameId: string;
  existingTeams: string[];
}) {
  const [team, setTeam] = useState(row.teamName ?? "");
  const [isCaptain, setIsCaptain] = useState(row.role === "captain");
  const listId = `teams-${row.id}`;

  const input =
    "px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";

  return (
    <form
      action={assignTeamAction}
      className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-gray-50"
    >
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="gameId" value={gameId} />
      <input
        type="hidden"
        name="role"
        value={isCaptain ? "captain" : "player"}
      />

      <div className="flex items-center gap-2 flex-1 min-w-40">
        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm font-bold shrink-0">
          {row.participantName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {row.participantName}
          </p>
          {row.participantWiki && (
            <p className="text-xs text-gray-400 truncate">
              {row.participantWiki}
            </p>
          )}
        </div>
      </div>

      <input
        name="teamName"
        list={listId}
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        placeholder="Team name"
        className={input + " w-40"}
      />
      <datalist id={listId}>
        {existingTeams.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={() => setIsCaptain((c) => !c)}
        className={
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors " +
          (isCaptain
            ? "bg-brand-red text-white border-brand-red"
            : "bg-white text-gray-500 border-gray-200 hover:border-brand-red")
        }
        title="Toggle captain"
      >
        <Crown size={14} /> {isCaptain ? "Captain" : "Player"}
      </button>

      <button
        type="submit"
        className="flex items-center gap-1.5 bg-brand-blue text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors"
      >
        <Save size={14} /> Save
      </button>
    </form>
  );
}

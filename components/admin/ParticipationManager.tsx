"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Crown,
  Upload,
  ListOrdered,
  Pencil,
  X,
} from "lucide-react";
import type { ParticipationModel, GameModel } from "@/lib/types";
import {
  addParticipationAction,
  updateParticipationAction,
  deleteParticipationAction,
  bulkImportParticipationsAction,
  autoRankAction,
  setTeamWinnerAction,
} from "@/lib/actions";

const input =
  "px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";

export default function ParticipationManager({
  game,
  eventId,
  rows,
}: {
  game: GameModel;
  eventId: string;
  rows: ParticipationModel[];
}) {
  const isTeam = game.type === "team";
  const [showBulk, setShowBulk] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // distinct team names for the winner toggle (team games)
  const teams = Array.from(
    new Set(rows.map((r) => r.teamName).filter(Boolean) as string[]),
  );

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowBulk((s) => !s)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:border-brand-blue hover:text-brand-blue transition-colors"
        >
          <Upload size={16} /> Bulk import
        </button>

        <form action={autoRankAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="gameId" value={game.id} />
          <input type="hidden" name="markWinner" value="on" />
          <button className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:border-brand-green hover:text-brand-green transition-colors">
            <ListOrdered size={16} /> Auto-rank by score
          </button>
        </form>
      </div>

      {/* BULK IMPORT */}
      {showBulk && (
        <form
          action={bulkImportParticipationsAction}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="gameId" value={game.id} />
          <h3 className="font-bold text-gray-900 mb-2">Bulk import</h3>
          <p className="text-sm text-gray-500 mb-3">
            One participant per line. Format:{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              name, wiki, team, score
            </code>{" "}
            — only the name is required. Leave a field empty but keep the comma,
            e.g.{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              Aarav,,Team Falcon,80
            </code>
            .
          </p>
          <textarea
            name="bulk"
            rows={6}
            required
            placeholder={
              "Aarav,Status_401,Team Falcon,85\nPriya,,Team Falcon,85\nRohan,,Team Owl,70"
            }
            className={input + " w-full font-mono"}
          />
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors">
              <Save size={16} /> Import
            </button>
            <button
              type="button"
              onClick={() => setShowBulk(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* TEAM WINNER TOGGLES */}
      {isTeam && teams.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" /> Team winners
          </h3>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => {
              const isWinner = rows.some(
                (r) => r.teamName === team && r.isWinner,
              );
              return (
                <form key={team} action={setTeamWinnerAction}>
                  <input type="hidden" name="eventId" value={eventId} />
                  <input type="hidden" name="gameId" value={game.id} />
                  <input type="hidden" name="teamName" value={team} />
                  <input
                    type="hidden"
                    name="makeWinner"
                    value={isWinner ? "false" : "true"}
                  />
                  <button
                    className={
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors " +
                      (isWinner
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-green")
                    }
                  >
                    {isWinner && <Crown size={14} />} {team}
                  </button>
                </form>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Tap a team to toggle winner status.
          </p>
        </div>
      )}

      {/* EXISTING ROWS */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            Participants{" "}
            <span className="text-gray-400 font-normal">({rows.length})</span>
          </h3>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400">
            No participants yet. Add one below or use bulk import.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) =>
              editingId === r.id ? (
                <li key={r.id} className="p-4 bg-blue-50/40">
                  <form
                    action={updateParticipationAction}
                    className="flex flex-col gap-2"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="eventId" value={eventId} />
                    <input type="hidden" name="gameId" value={game.id} />
                    <div className="flex flex-wrap gap-2">
                      <input
                        name="participantName"
                        defaultValue={r.participantName}
                        placeholder="Name"
                        required
                        className={input + " flex-1 min-w-32"}
                      />
                      <input
                        name="participantWiki"
                        defaultValue={r.participantWiki ?? ""}
                        placeholder="Wiki handle"
                        className={input + " w-36"}
                      />
                      <input
                        name="contactEmail"
                        defaultValue={r.contactEmail ?? ""}
                        placeholder="Email"
                        className={input + " w-44"}
                      />
                      <input
                        name="contactPhone"
                        defaultValue={r.contactPhone ?? ""}
                        placeholder="Phone"
                        className={input + " w-32"}
                      />
                      {isTeam && (
                        <input
                          name="teamName"
                          defaultValue={r.teamName ?? ""}
                          placeholder="Team"
                          className={input + " w-32"}
                        />
                      )}
                      <select
                        name="role"
                        defaultValue={r.role}
                        className={input + " w-28"}
                      >
                        <option value="player">Player</option>
                        <option value="captain">Captain</option>
                      </select>
                      <input
                        type="number"
                        name="score"
                        defaultValue={r.score ?? ""}
                        placeholder="Score"
                        className={input + " w-24"}
                      />
                      <input
                        type="number"
                        name="rank"
                        defaultValue={r.rank ?? ""}
                        placeholder="Rank"
                        className={input + " w-20"}
                      />
                      <label className="flex items-center gap-1.5 text-sm text-gray-600 px-2">
                        <input
                          type="checkbox"
                          name="isWinner"
                          defaultChecked={r.isWinner}
                          className="w-4 h-4 accent-brand-green"
                        />
                        Winner
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 bg-brand-blue text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors">
                        <Save size={15} /> Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700"
                      >
                        <X size={15} /> Cancel
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li key={r.id} className="hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 px-5 py-3">
                    <span className="w-8 text-center text-sm font-bold text-gray-400">
                      {r.rank ?? "-"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                        {r.participantName}
                        {r.role === "captain" && (
                          <span className="text-xs text-brand-red font-bold">
                            (C)
                          </span>
                        )}
                        {r.isWinner && (
                          <Crown size={14} className="text-yellow-500" />
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {[r.participantWiki, r.teamName]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-brand-blue w-16 text-right">
                      {r.score ?? "-"}
                    </span>
                    <button
                      onClick={() => setEditingId(r.id)}
                      className="p-2 text-gray-400 hover:text-brand-blue transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <form action={deleteParticipationAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="eventId" value={eventId} />
                      <input type="hidden" name="gameId" value={game.id} />
                      <button
                        className="p-2 text-gray-400 hover:text-brand-red transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                  {r.submissionText && (
                    <details className="mx-5 mb-3 -mt-1">
                      <summary className="cursor-pointer text-xs font-semibold text-brand-blue hover:text-brand-green inline-flex items-center gap-1">
                        <Pencil size={12} /> View submission (
                        {r.submissionText.trim().split(/\s+/).length} words)
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs leading-relaxed text-gray-700 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                        {r.submissionText}
                      </pre>
                    </details>
                  )}
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {/* ADD ROW */}
      <form
        action={addParticipationAction}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
      >
        <input type="hidden" name="eventId" value={eventId} />
        <input type="hidden" name="gameId" value={game.id} />
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Plus size={18} className="text-brand-blue" /> Add participant
        </h3>
        <div className="flex flex-wrap gap-2">
          <input
            name="participantName"
            placeholder="Name *"
            required
            className={input + " flex-1 min-w-32"}
          />
          <input
            name="participantWiki"
            placeholder="Wiki handle"
            className={input + " w-36"}
          />
          <input
            name="contactEmail"
            placeholder="Email (for play login)"
            className={input + " w-44"}
          />
          <input
            name="contactPhone"
            placeholder="Phone"
            className={input + " w-32"}
          />
          {isTeam && (
            <input
              name="teamName"
              placeholder="Team"
              className={input + " w-32"}
            />
          )}
          <select name="role" defaultValue="player" className={input + " w-28"}>
            <option value="player">Player</option>
            <option value="captain">Captain</option>
          </select>
          <input
            type="number"
            name="score"
            placeholder="Score"
            className={input + " w-24"}
          />
          <input
            type="number"
            name="rank"
            placeholder="Rank"
            className={input + " w-20"}
          />
          <label className="flex items-center gap-1.5 text-sm text-gray-600 px-2">
            <input
              type="checkbox"
              name="isWinner"
              className="w-4 h-4 accent-brand-green"
            />
            Winner
          </label>
          <button className="flex items-center gap-1.5 bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-green transition-colors">
            <Plus size={16} /> Add
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import { Gamepad2 } from "lucide-react";
import type { GameSummary, GameType, Mode } from "@/lib/types";
import { GameCard } from "./Cards";

type TypeFilter = "all" | GameType;
type ModeFilter = "all" | Mode;

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All games" },
  { value: "team", label: "Team" },
  { value: "individual", label: "Individual" },
];

const MODE_TABS: { value: ModeFilter; label: string }[] = [
  { value: "all", label: "Any mode" },
  { value: "offline", label: "Offline" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export default function GamesGrid({ games }: { games: GameSummary[] }) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const filtered = useMemo(
    () =>
      games.filter(
        (g) =>
          (typeFilter === "all" || g.type === typeFilter) &&
          (modeFilter === "all" || g.mode === modeFilter),
      ),
    [games, typeFilter, modeFilter],
  );

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition-colors border",
                typeFilter === t.value
                  ? "bg-brand-blue text-white border-brand-blue"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-blue hover:text-brand-blue",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          {MODE_TABS.map((m) => (
            <button
              key={m.value}
              onClick={() => setModeFilter(m.value)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border",
                modeFilter === m.value
                  ? "bg-brand-green text-white border-brand-green"
                  : "bg-white text-gray-500 border-gray-200 hover:border-brand-green hover:text-brand-green",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Gamepad2 size={48} className="mb-4" />
          <p className="font-medium">No games match these filters.</p>
        </div>
      )}
    </div>
  );
}

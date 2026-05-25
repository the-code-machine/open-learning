"use client";

import type { ComponentType } from "react";
import type { GamePlayProps } from "@/lib/game-types";
import QuizGame from "./QuizGame";
import RealOrFakeGame from "./RealOrFakeGame";

/**
 * Registry of playable game components.
 *
 * Each game type is a self-contained component that owns its own logic and
 * content. To add a new game type:
 *  1. Build a play component (props: GamePlayProps) in components/games/.
 *     Put its questions/rules/scoring inside the component itself.
 *  2. Add an entry to lib/games-registry.json (key, label) so it appears in
 *     the admin "playable component" dropdown.
 *  3. Add a matching entry here keyed by the same string.
 */
export interface RegistryEntry {
  Play: ComponentType<GamePlayProps>;
}

export const GAME_REGISTRY: Record<string, RegistryEntry> = {
  "quiz-v1": { Play: QuizGame },
  "real-or-fake-v1": { Play: RealOrFakeGame },
};

export function getRegistryEntry(key: string): RegistryEntry | null {
  return GAME_REGISTRY[key] ?? null;
}

/**
 * Game component contract.
 *
 * Every playable game type is a self-contained component that owns ALL its
 * logic and content (questions, points, rules, timing). It computes the final
 * score and reports just the number via onFinish. The score API and
 * participations table never know anything game-specific.
 *
 * Scoring is universal: a single number. Any maximum is the component's own
 * business; the API records whatever number the component reports (best wins).
 */

/** Identity of the person playing (loginless: name + optional wiki handle). */
export interface PlayIdentity {
  participantName: string;
  participantWiki?: string;
  teamName?: string;
}

/** Props every play component receives. */
export interface GamePlayProps {
  gameId: string;
  eventId: string;
  identity: PlayIdentity;
  /**
   * Call when the game is over with the final numeric score.
   * The host handles persisting it through /api/score.
   */
  onFinish: (score: number) => Promise<void> | void;
}

/* ---------- Quiz component config ---------- */

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** index into options of the correct answer */
  correctIndex: number;
  /** points awarded for a correct answer */
  points: number;
}

export interface QuizConfig {
  /** seconds allowed for the whole quiz; 0 = untimed */
  timeLimit: number;
  questions: QuizQuestion[];
}

export const EMPTY_QUIZ_CONFIG: QuizConfig = {
  timeLimit: 0,
  questions: [],
};

/** Sum of all question points — the natural max score for a quiz. */
export function quizMaxScore(config: QuizConfig): number {
  return config.questions.reduce((sum, q) => sum + (q.points || 0), 0);
}

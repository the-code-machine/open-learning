"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight } from "lucide-react";
import type { GamePlayProps, QuizConfig } from "@/lib/game-types";

/**
 * QUIZ_CONFIG — this game owns its own logic and content.
 * Edit questions, points, and the time limit right here in code.
 * The API never sees this; the component computes the final score and reports
 * just the number. To make a different quiz, copy this component to a new key
 * (e.g. quiz-history-v1) and register it.
 */
const QUIZ_CONFIG: QuizConfig = {
  timeLimit: 60,
  questions: [
    {
      id: "q1",
      prompt: "What does Wikimedia Commons primarily store?",
      options: ["Source code", "Freely-licensed media files", "User passwords"],
      correctIndex: 1,
      points: 10,
    },
    {
      id: "q2",
      prompt: "Which license family is common for Commons uploads?",
      options: ["Creative Commons", "Proprietary EULA", "No license"],
      correctIndex: 0,
      points: 10,
    },
    {
      id: "q3",
      prompt: "What is a 'stub' on a wiki?",
      options: ["A locked page", "A very short article", "A deleted page"],
      correctIndex: 1,
      points: 10,
    },
  ],
};

type Phase = "intro" | "playing" | "done";

export default function QuizGame({ identity, onFinish }: GamePlayProps) {
  const config = QUIZ_CONFIG;
  const maxScore = config.questions.reduce((s, q) => s + (q.points || 0), 0);
  const questions = config.questions;
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit || 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const finish = useCallback(
    async (finalScore: number) => {
      setPhase("done");
      setSaving(true);
      try {
        await onFinish(Math.min(finalScore, maxScore || finalScore));
        setSaved(true);
      } finally {
        setSaving(false);
      }
    },
    [onFinish, maxScore],
  );

  // countdown timer (only when timed and playing)
  useEffect(() => {
    if (phase !== "playing" || !config.timeLimit) return;
    if (timeLeft <= 0) {
      finish(score);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, config.timeLimit, score, finish]);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
        This quiz has no questions configured yet.
      </div>
    );
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;

  function choose(i: number) {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === q.correctIndex) setScore((s) => s + (q.points || 0));
  }

  function next() {
    if (isLast) {
      finish(score + 0); // score already includes this question
      return;
    }
    setCurrent((c) => c + 1);
    setPicked(null);
    setRevealed(false);
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* INTRO */}
      {phase === "intro" && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mx-auto mb-4">
            <Trophy size={30} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready, {identity.participantName}?
          </h2>
          <p className="text-gray-500 mb-2">
            {questions.length} questions · {maxScore} points possible
            {config.timeLimit ? ` · ${config.timeLimit}s total` : ""}
          </p>
          <button
            onClick={() => setPhase("playing")}
            className="mt-4 inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
          >
            Start <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* PLAYING */}
      {phase === "playing" && (
        <div>
          {/* progress + timer */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-500">
              Question {current + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-brand-blue">
                {score} pts
              </span>
              {config.timeLimit > 0 && (
                <span className="flex items-center gap-1.5 text-sm font-bold text-brand-red">
                  <Clock size={15} />
                  {mins}:{String(secs).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* question */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{q.prompt}</h3>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isCorrect = i === q.correctIndex;
                const isPicked = i === picked;
                let cls =
                  "border-gray-200 hover:border-brand-blue hover:bg-blue-50/40";
                if (revealed && isCorrect)
                  cls = "border-brand-green bg-brand-green/10";
                else if (revealed && isPicked && !isCorrect)
                  cls = "border-brand-red bg-red-50";
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={revealed}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-colors flex items-center justify-between ${cls}`}
                  >
                    <span>{opt}</span>
                    {revealed && isCorrect && (
                      <CheckCircle2 size={20} className="text-brand-green" />
                    )}
                    {revealed && isPicked && !isCorrect && (
                      <XCircle size={20} className="text-brand-red" />
                    )}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <button
                onClick={next}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
              >
                {isLast ? "Finish" : "Next question"} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* DONE */}
      {phase === "done" && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto mb-4">
            <Trophy size={30} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {score} / {maxScore} points
          </h2>
          <p className="text-gray-500">
            Nice work, {identity.participantName}.
          </p>
          <p className="text-sm mt-3">
            {saving && (
              <span className="text-gray-400">Saving your score…</span>
            )}
            {saved && (
              <span className="text-brand-green font-semibold">
                Score recorded ✓
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

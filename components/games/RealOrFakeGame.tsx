"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  X,
  Clock,
  Trophy,
  ArrowRight,
  Zap,
  RotateCcw,
} from "lucide-react";
import type { GamePlayProps } from "@/lib/game-types";

/**
 * REAL OR FAKE — Wikipedia edition.
 *
 * Self-contained game (owns all its logic and content). The player decides
 * whether each article title is a REAL Wikipedia article or a FAKE one, within
 * 10 seconds per question. 10 questions.
 *
 * SCORING (one number, leaderboard-friendly, ties broken by speed):
 *   - correct count is the PRIMARY key: each correct answer = BASE points.
 *   - speed is a pure TIEBREAKER: a small bonus from remaining time, scaled so
 *     the most speed bonus possible across all 10 questions can never add up to
 *     a single BASE. So 10-correct-slow ALWAYS beats 9-correct-fast; speed only
 *     separates players with the SAME number correct.
 * The player still sees the simple "X / 10 correct"; the big number is just how
 * the leaderboard ranks and avoids many tied winners.
 */

const TOTAL_QUESTIONS = 10;
const SECONDS_PER_Q = 10;
// Each correct answer is worth far more than every speed bonus combined, so
// correct count strictly dominates and time only breaks ties.
const BASE_POINTS = 100;
// Max speed bonus per question; 10 questions * 999 = 9990 < BASE_POINTS.
const MAX_SPEED_BONUS = 99;

interface Item {
  title: string;
  real: boolean;
  /** shown after answering — the fun reveal */
  blurb: string;
}

// Real entries are genuine Wikipedia articles; fakes are invented but plausible.
const ITEMS: Item[] = [
  {
    title: "List of people who have lived in airports",
    real: true,
    blurb:
      "Real. Wikipedia really does track people who lived in airport terminals.",
  },
  {
    title: "Death by coconut",
    real: true,
    blurb: "Real. Falling coconuts have their own well-cited article.",
  },
  {
    title: "Competitive eating of invisible sandwiches",
    real: false,
    blurb: "Fake. We made this up. Probably.",
  },
  {
    title: "Toast sandwich",
    real: true,
    blurb:
      "Real. A slice of toast inside two slices of bread. Victorian frugality.",
  },
  {
    title: "International Federation of Competitive Napping",
    real: false,
    blurb: "Fake. Sadly, no governing body for naps exists.",
  },
  {
    title: "Gravity hill",
    real: true,
    blurb: "Real. Places where a slight downhill looks like an uphill.",
  },
  {
    title: "List of inventors killed by their own inventions",
    real: true,
    blurb: "Real. A genuinely sobering and famous Wikipedia list.",
  },
  {
    title: "Annual World Staring Contest Championship",
    real: false,
    blurb: "Fake. Blink and you'll miss that this one isn't real.",
  },
  {
    title: "Cat gap",
    real: true,
    blurb: "Real. A period in the fossil record with very few cat fossils.",
  },
  {
    title: "Museum of Forgotten Passwords",
    real: false,
    blurb: "Fake. We forgot to make it real.",
  },
];

type Phase = "intro" | "playing" | "feedback" | "done";

export default function RealOrFakeGame({ identity, onFinish }: GamePlayProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<
    "right" | "wrong" | "timeout" | null
  >(null);
  const [lastGain, setLastGain] = useState(0);
  // milliseconds remaining, ticks smoothly for the ring
  const [msLeft, setMsLeft] = useState(SECONDS_PER_Q * 1000);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const item = ITEMS[current];

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    async (finalScore: number, finalCorrect: number) => {
      stopTimer();
      setPhase("done");
      setSaving(true);
      try {
        await onFinish(finalScore);
        setSaved(true);
      } finally {
        setSaving(false);
      }
      void finalCorrect;
    },
    [onFinish, stopTimer],
  );

  // answer handler (shared by click and timeout)
  const answer = useCallback(
    (choice: boolean | null) => {
      if (phase !== "playing") return;
      stopTimer();

      const timedOut = choice === null;
      const correct = !timedOut && choice === item.real;
      let gain = 0;
      if (correct) {
        // speed bonus scaled to [0, MAX_SPEED_BONUS] from remaining time
        const speedBonus = Math.round(
          (msLeft / (SECONDS_PER_Q * 1000)) * MAX_SPEED_BONUS,
        );
        gain = BASE_POINTS + speedBonus;
      }

      const nextScore = score + gain;
      const nextCorrect = correctCount + (correct ? 1 : 0);
      setScore(nextScore);
      setCorrectCount(nextCorrect);
      setLastGain(gain);
      setLastResult(timedOut ? "timeout" : correct ? "right" : "wrong");
      setPhase("feedback");

      // brief feedback, then advance
      setTimeout(() => {
        if (current + 1 >= TOTAL_QUESTIONS) {
          finish(nextScore, nextCorrect);
        } else {
          setCurrent((c) => c + 1);
          setMsLeft(SECONDS_PER_Q * 1000);
          setLastResult(null);
          setPhase("playing");
        }
      }, 1400);
    },
    [phase, item, msLeft, score, correctCount, current, finish, stopTimer],
  );

  // countdown ticker (50ms for a smooth ring)
  useEffect(() => {
    if (phase !== "playing") return;
    tickRef.current = setInterval(() => {
      setMsLeft((ms) => {
        if (ms <= 50) {
          return 0;
        }
        return ms - 50;
      });
    }, 50);
    return stopTimer;
  }, [phase, current, stopTimer]);

  // when time runs out
  useEffect(() => {
    if (phase === "playing" && msLeft <= 0) {
      answer(null);
    }
  }, [msLeft, phase, answer]);

  const secondsLeft = Math.ceil(msLeft / 1000);
  const ringPct = (msLeft / (SECONDS_PER_Q * 1000)) * 100;
  const ringColor =
    msLeft > 6000
      ? "var(--brand-green)"
      : msLeft > 3000
        ? "#d99100"
        : "var(--brand-red)";

  /* ---------- INTRO ---------- */
  if (phase === "intro") {
    return (
      <div className="rof-card">
        <style>{styles}</style>
        <div className="rof-intro">
          <div className="rof-badge">
            <Zap size={30} />
          </div>
          <h2 className="rof-title">Real or Fake?</h2>
          <p className="rof-sub">
            Ten Wikipedia article titles, {identity.participantName}. For each
            one, decide fast: is it a <b>real</b> article or a <b>fake</b> we
            invented?
          </p>
          <ul className="rof-rules">
            <li>
              <Clock size={15} /> {SECONDS_PER_Q} seconds per question
            </li>
            <li>
              <Check size={15} /> 1 point per correct answer
            </li>
            <li>
              <Zap size={15} /> Answer faster to rank higher on ties
            </li>
          </ul>
          <button
            className="rof-btn rof-btn-go"
            onClick={() => setPhase("playing")}
          >
            Start playing <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- DONE ---------- */
  if (phase === "done") {
    return (
      <div className="rof-card">
        <style>{styles}</style>
        <div className="rof-intro">
          <div className="rof-badge rof-badge-win">
            <Trophy size={30} />
          </div>
          <h2 className="rof-title">
            {correctCount} / {TOTAL_QUESTIONS} correct
          </h2>
          <p className="rof-sub">
            Nice, {identity.participantName}! Your speed counts too — answer
            faster next time to climb the leaderboard.
          </p>
          <div className="rof-scorepill">
            <Zap size={16} /> {score.toLocaleString()} points
          </div>
          <p className="rof-savestate">
            {saving && <span className="rof-saving">Saving your score…</span>}
            {saved && <span className="rof-saved">Score recorded ✓</span>}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- PLAYING / FEEDBACK ---------- */
  const showingFeedback = phase === "feedback";

  return (
    <div className="rof-card">
      <style>{styles}</style>

      {/* top bar: progress + score + timer ring */}
      <div className="rof-top">
        <div className="rof-progress">
          <span className="rof-qnum">
            {current + 1}
            <span className="rof-qtot">/{TOTAL_QUESTIONS}</span>
          </span>
          <div className="rof-dots">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <span
                key={i}
                className={
                  "rof-dot " +
                  (i < current
                    ? "rof-dot-done"
                    : i === current
                      ? "rof-dot-now"
                      : "")
                }
              />
            ))}
          </div>
        </div>

        <div
          className="rof-ring"
          style={{
            ["--pct" as string]: `${ringPct}`,
            ["--ring" as string]: ringColor,
          }}
        >
          <span className="rof-ring-num" style={{ color: ringColor }}>
            {secondsLeft}
          </span>
        </div>
      </div>

      {/* the title card */}
      <div
        className={
          "rof-stage " +
          (showingFeedback && lastResult === "right"
            ? "rof-stage-right"
            : showingFeedback && lastResult
              ? "rof-stage-wrong"
              : "")
        }
      >
        <span className="rof-kicker">Is this a real Wikipedia article?</span>
        <h3 className="rof-article">“{item.title}”</h3>

        {showingFeedback && (
          <div
            className={
              "rof-verdict " +
              (lastResult === "right"
                ? "rof-verdict-right"
                : "rof-verdict-wrong")
            }
          >
            <div className="rof-verdict-icon">
              {lastResult === "right" ? <Check size={22} /> : <X size={22} />}
            </div>
            <div>
              <strong>
                {lastResult === "right"
                  ? "Correct!"
                  : lastResult === "timeout"
                    ? "Time's up!"
                    : "Not quite."}
                {item.real ? " It's REAL." : " It's FAKE."}
              </strong>
              <p>{item.blurb}</p>
              {lastResult === "right" && lastGain > 0 && (
                <span className="rof-gain">+{lastGain.toLocaleString()}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* answer buttons */}
      <div className="rof-actions">
        <button
          className="rof-btn rof-btn-real"
          disabled={showingFeedback}
          onClick={() => answer(true)}
        >
          <Check size={20} /> Real
        </button>
        <button
          className="rof-btn rof-btn-fake"
          disabled={showingFeedback}
          onClick={() => answer(false)}
        >
          <X size={20} /> Fake
        </button>
      </div>

      <div className="rof-footscore">
        <RotateCcw size={13} /> {correctCount} correct so far
      </div>
    </div>
  );
}

/* ---------- styles (scoped via unique rof- prefix) ---------- */
const styles = `
.rof-card{
  background:#fff;border-radius:24px;border:1px solid #eef0f2;
  box-shadow:0 10px 40px -12px rgba(0,40,80,.18);
  padding:20px;max-width:560px;margin:0 auto;overflow:hidden;
  font-family:inherit;
}
@media(min-width:640px){.rof-card{padding:28px}}

/* intro / done */
.rof-intro{text-align:center;padding:8px 4px 12px}
.rof-badge{width:64px;height:64px;border-radius:20px;margin:0 auto 16px;
  display:flex;align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,var(--brand-blue),var(--brand-green));
  box-shadow:0 8px 22px -6px rgba(0,104,152,.5);animation:rof-pop .4s ease}
.rof-badge-win{background:linear-gradient(135deg,#e6a700,var(--brand-red))}
.rof-title{font-size:1.8rem;font-weight:800;color:#10243a;margin:0 0 8px;letter-spacing:-.02em}
.rof-sub{color:#5b6b7a;font-size:.95rem;line-height:1.5;margin:0 auto 18px;max-width:38ch}
.rof-rules{list-style:none;padding:0;margin:0 auto 22px;display:inline-flex;
  flex-direction:column;gap:8px;text-align:left}
.rof-rules li{display:flex;align-items:center;gap:8px;color:#33485c;font-weight:600;font-size:.9rem}
.rof-rules li svg{color:var(--brand-blue)}
.rof-scorepill{display:inline-flex;align-items:center;gap:8px;margin-top:6px;
  background:var(--brand-blue);color:#fff;font-weight:800;padding:10px 18px;border-radius:999px;
  font-size:1.05rem;box-shadow:0 6px 16px -6px rgba(0,104,152,.6)}
.rof-savestate{margin-top:14px;font-size:.85rem;min-height:1.2em}
.rof-saving{color:#94a3b2}
.rof-saved{color:var(--brand-green);font-weight:700}

/* top bar */
.rof-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}
.rof-progress{flex:1;min-width:0}
.rof-qnum{font-weight:800;color:#10243a;font-size:1.1rem}
.rof-qtot{color:#9fb0bd;font-weight:700;font-size:.85rem}
.rof-dots{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.rof-dot{width:100%;max-width:22px;height:6px;border-radius:3px;background:#e6eaee;flex:1}
.rof-dot-done{background:var(--brand-green)}
.rof-dot-now{background:var(--brand-blue);animation:rof-pulse 1s ease-in-out infinite}

/* timer ring */
.rof-ring{position:relative;width:56px;height:56px;border-radius:50%;flex:none;
  background:conic-gradient(var(--ring) calc(var(--pct)*1%),#eef1f4 0);
  transition:background .1s linear;display:flex;align-items:center;justify-content:center}
.rof-ring::after{content:"";position:absolute;inset:6px;background:#fff;border-radius:50%}
.rof-ring-num{position:relative;z-index:1;font-weight:800;font-size:1.25rem;font-variant-numeric:tabular-nums}

/* stage */
.rof-stage{background:linear-gradient(160deg,#f7fafc,#eef4f8);border:1px solid #e7eef3;
  border-radius:18px;padding:26px 20px;min-height:150px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;transition:all .25s ease}
.rof-stage-right{background:linear-gradient(160deg,#e9f9f0,#dff5e9);border-color:var(--brand-green)}
.rof-stage-wrong{background:linear-gradient(160deg,#fdeaea,#fbe0e0);border-color:var(--brand-red);
  animation:rof-shake .4s ease}
.rof-kicker{font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#7c8b98}
.rof-article{font-size:1.5rem;font-weight:800;color:#10243a;margin:10px 0 0;line-height:1.25;letter-spacing:-.01em}
@media(min-width:640px){.rof-article{font-size:1.8rem}}

/* verdict */
.rof-verdict{display:flex;gap:12px;text-align:left;margin-top:18px;
  background:#fff;border-radius:14px;padding:14px;width:100%;animation:rof-pop .3s ease;position:relative}
.rof-verdict-icon{width:38px;height:38px;border-radius:10px;flex:none;color:#fff;
  display:flex;align-items:center;justify-content:center}
.rof-verdict-right .rof-verdict-icon{background:var(--brand-green)}
.rof-verdict-wrong .rof-verdict-icon{background:var(--brand-red)}
.rof-verdict strong{display:block;color:#10243a;font-size:.95rem;margin-bottom:2px}
.rof-verdict p{margin:0;color:#5b6b7a;font-size:.85rem;line-height:1.4}
.rof-gain{position:absolute;top:12px;right:14px;font-weight:800;color:var(--brand-green);
  font-size:1rem;animation:rof-float 1s ease}

/* actions */
.rof-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
.rof-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;
  border:none;cursor:pointer;font-weight:800;font-size:1.05rem;padding:16px;border-radius:14px;
  transition:transform .12s ease,box-shadow .12s ease,opacity .12s;font-family:inherit}
.rof-btn:active{transform:translateY(2px) scale(.99)}
.rof-btn:disabled{opacity:.55;cursor:not-allowed}
.rof-btn-real{background:var(--brand-green);color:#fff;box-shadow:0 6px 16px -6px rgba(48,157,100,.7)}
.rof-btn-fake{background:var(--brand-red);color:#fff;box-shadow:0 6px 16px -6px rgba(159,37,39,.6)}
.rof-btn-real:hover:not(:disabled),.rof-btn-fake:hover:not(:disabled){transform:translateY(-2px)}
.rof-btn-go{background:var(--brand-blue);color:#fff;width:100%;justify-content:center;
  box-shadow:0 8px 20px -6px rgba(0,104,152,.6)}
.rof-btn-go:hover{background:var(--brand-green)}

.rof-footscore{display:flex;align-items:center;justify-content:center;gap:6px;
  margin-top:14px;color:#9fb0bd;font-size:.8rem;font-weight:600}

@keyframes rof-pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes rof-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes rof-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes rof-float{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

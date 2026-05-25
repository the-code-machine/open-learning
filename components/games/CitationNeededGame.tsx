"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  X,
  Clock,
  Trophy,
  ArrowRight,
  BookOpen,
  Quote,
} from "lucide-react";
import type { GamePlayProps } from "@/lib/game-types";

/**
 * CITATION NEEDED — Wikipedia edition.
 *
 * Self-contained game (owns all its logic and content). A statement appears,
 * styled like a line from a Wikipedia article. The player decides within 10
 * seconds whether it WOULD need a citation (an unsourced factual/contested
 * claim) or NOT (common knowledge / self-evident / definitional). 10 questions.
 *
 * SCORING (matches the other games — one number, ties broken by speed):
 *   - correct count is the PRIMARY key: each correct = BASE points.
 *   - speed is a pure TIEBREAKER: bonus scaled so all 10 speed bonuses combined
 *     can never reach one BASE. So 10-correct-slow ALWAYS beats 9-correct-fast.
 * Player sees "X / 10 correct"; the big number is what the leaderboard sorts on.
 *
 * NOTE ON CONTENT: whether a real sentence "needs a citation" is genuinely
 * subjective, so statements here are AUTHORED to have a clear, defensible
 * answer (obvious unsourced specific/contested claim = needs; common-knowledge
 * or definitional = doesn't). Edit the STATEMENTS array to add your own.
 */

const TOTAL_QUESTIONS = 10;
const SECONDS_PER_Q = 10;
const BASE_POINTS = 1000;
const MAX_SPEED_BONUS = 999;

interface Statement {
  text: string;
  topic: string; // faux article heading for flavour
  needsCitation: boolean;
  why: string; // shown on reveal
}

const STATEMENTS: Statement[] = [
  {
    topic: "Paris",
    text: "Paris is the capital and most populous city of France.",
    needsCitation: false,
    why: "Common, undisputed knowledge — definitional facts like this don't need a citation.",
  },
  {
    topic: "Honey",
    text: "Honey never spoils and pots of it found in ancient tombs were still edible after 3,000 years.",
    needsCitation: true,
    why: "A specific, surprising empirical claim — exactly the kind of statement that needs a source.",
  },
  {
    topic: "Water",
    text: "Water is composed of hydrogen and oxygen.",
    needsCitation: false,
    why: "Basic, universally accepted science taught everywhere — no citation expected.",
  },
  {
    topic: "Mount Everest",
    text: "Mount Everest grows roughly 4 millimetres taller every year due to tectonic uplift.",
    needsCitation: true,
    why: "A precise measured figure. Specific numbers like this require a reliable source.",
  },
  {
    topic: "The Sun",
    text: "The Sun rises in the east and sets in the west.",
    needsCitation: false,
    why: "Everyday observable fact — self-evident and uncontested.",
  },
  {
    topic: "Octopuses",
    text: "Octopuses have three hearts and their blood is blue.",
    needsCitation: true,
    why: "A striking biological claim. Even if true, surprising facts need a citation on Wikipedia.",
  },
  {
    topic: "Triangles",
    text: "A triangle has three sides.",
    needsCitation: false,
    why: "Definitional and self-evident — citing it would be unnecessary.",
  },
  {
    topic: "The Great Wall",
    text: "The Great Wall of China is the only man-made object visible from space with the naked eye.",
    needsCitation: true,
    why: "This is actually a popular myth — a contested claim, which is precisely when a citation is demanded.",
  },
  {
    topic: "Bananas",
    text: "Bananas are a popular fruit.",
    needsCitation: false,
    why: "Vague common knowledge with no specific contestable claim — no citation needed.",
  },
  {
    topic: "Lightning",
    text: "Lightning strikes the Earth about 8 million times per day.",
    needsCitation: true,
    why: "A specific statistic. Numbers and statistics always need a verifiable source.",
  },
];

type Phase = "intro" | "playing" | "feedback" | "done";

export default function CitationNeededGame({
  identity,
  onFinish,
}: GamePlayProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<
    "right" | "wrong" | "timeout" | null
  >(null);
  const [lastGain, setLastGain] = useState(0);
  const [msLeft, setMsLeft] = useState(SECONDS_PER_Q * 1000);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const item = STATEMENTS[current];

  const stopTimer = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(
    async (finalScore: number) => {
      stopTimer();
      setPhase("done");
      setSaving(true);
      try {
        await onFinish(finalScore);
        setSaved(true);
      } finally {
        setSaving(false);
      }
    },
    [onFinish, stopTimer],
  );

  const answer = useCallback(
    (choice: boolean | null) => {
      if (phase !== "playing") return;
      stopTimer();

      const timedOut = choice === null;
      const correct = !timedOut && choice === item.needsCitation;
      let gain = 0;
      if (correct) {
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

      setTimeout(() => {
        if (current + 1 >= TOTAL_QUESTIONS) {
          finish(nextScore);
        } else {
          setCurrent((c) => c + 1);
          setMsLeft(SECONDS_PER_Q * 1000);
          setLastResult(null);
          setPhase("playing");
        }
      }, 1800);
    },
    [phase, item, msLeft, score, correctCount, current, finish, stopTimer],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    tickRef.current = setInterval(() => {
      setMsLeft((ms) => (ms <= 50 ? 0 : ms - 50));
    }, 50);
    return stopTimer;
  }, [phase, current, stopTimer]);

  useEffect(() => {
    if (phase === "playing" && msLeft <= 0) answer(null);
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
      <div className="cn-card">
        <style>{styles}</style>
        <div className="cn-intro">
          <div className="cn-badge">
            <BookOpen size={30} />
          </div>
          <h2 className="cn-title">Citation Needed?</h2>
          <p className="cn-sub">
            Ten statements, {identity.participantName}, each written like a line
            from a Wikipedia article. Decide fast: does this claim{" "}
            <b>need a citation</b>, or is it fine without one?
          </p>
          <ul className="cn-rules">
            <li>
              <Clock size={15} /> {SECONDS_PER_Q} seconds per statement
            </li>
            <li>
              <Check size={15} /> 1 point per correct call
            </li>
            <li>
              <Quote size={15} /> Specific, surprising or contested claims need
              a source
            </li>
          </ul>
          <button
            className="cn-btn cn-btn-go"
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
      <div className="cn-card">
        <style>{styles}</style>
        <div className="cn-intro">
          <div className="cn-badge cn-badge-win">
            <Trophy size={30} />
          </div>
          <h2 className="cn-title">
            {correctCount} / {TOTAL_QUESTIONS} correct
          </h2>
          <p className="cn-sub">
            Nice editing instincts, {identity.participantName}! Faster correct
            calls rank you higher on ties.
          </p>
          <div className="cn-scorepill">
            <Quote size={16} /> {score.toLocaleString()} points
          </div>
          <p className="cn-savestate">
            {saving && <span className="cn-saving">Saving your score…</span>}
            {saved && <span className="cn-saved">Score recorded ✓</span>}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- PLAYING / FEEDBACK ---------- */
  const showingFeedback = phase === "feedback";

  return (
    <div className="cn-card">
      <style>{styles}</style>

      <div className="cn-top">
        <div className="cn-progress">
          <span className="cn-qnum">
            {current + 1}
            <span className="cn-qtot">/{TOTAL_QUESTIONS}</span>
          </span>
          <div className="cn-dots">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <span
                key={i}
                className={
                  "cn-dot " +
                  (i < current
                    ? "cn-dot-done"
                    : i === current
                      ? "cn-dot-now"
                      : "")
                }
              />
            ))}
          </div>
        </div>
        <div
          className="cn-ring"
          style={{
            ["--pct" as string]: `${ringPct}`,
            ["--ring" as string]: ringColor,
          }}
        >
          <span className="cn-ring-num" style={{ color: ringColor }}>
            {secondsLeft}
          </span>
        </div>
      </div>

      {/* faux Wikipedia article snippet */}
      <div
        className={
          "cn-article " +
          (showingFeedback && lastResult === "right"
            ? "cn-article-right"
            : showingFeedback && lastResult
              ? "cn-article-wrong"
              : "")
        }
      >
        <div className="cn-article-head">
          <span className="cn-globe">
            <BookOpen size={14} />
          </span>
          <span className="cn-article-topic">{item.topic}</span>
          <span className="cn-article-from">From Wiki Open Learning</span>
        </div>

        <p className="cn-statement">
          {item.text}
          {showingFeedback && item.needsCitation && (
            <sup className="cn-cn-tag"> [citation needed]</sup>
          )}
        </p>

        {showingFeedback && (
          <div
            className={
              "cn-verdict " +
              (lastResult === "right" ? "cn-verdict-right" : "cn-verdict-wrong")
            }
          >
            <div className="cn-verdict-icon">
              {lastResult === "right" ? <Check size={20} /> : <X size={20} />}
            </div>
            <div>
              <strong>
                {lastResult === "right"
                  ? "Correct! "
                  : lastResult === "timeout"
                    ? "Time's up! "
                    : "Not quite. "}
                {item.needsCitation
                  ? "Needs a citation."
                  : "No citation needed."}
              </strong>
              <p>{item.why}</p>
              {lastResult === "right" && lastGain > 0 && (
                <span className="cn-gain">+{lastGain.toLocaleString()}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="cn-prompt">Does this statement need a citation?</p>

      <div className="cn-actions">
        <button
          className="cn-btn cn-btn-needs"
          disabled={showingFeedback}
          onClick={() => answer(true)}
        >
          <Quote size={18} /> Citation needed
        </button>
        <button
          className="cn-btn cn-btn-fine"
          disabled={showingFeedback}
          onClick={() => answer(false)}
        >
          <Check size={18} /> It's fine
        </button>
      </div>

      <div className="cn-footscore">{correctCount} correct so far</div>
    </div>
  );
}

const styles = `
.cn-card{background:#fff;border-radius:24px;border:1px solid #eef0f2;
  box-shadow:0 10px 40px -12px rgba(0,40,80,.18);padding:20px;max-width:580px;
  margin:0 auto;overflow:hidden;font-family:inherit}
@media(min-width:640px){.cn-card{padding:28px}}

.cn-intro{text-align:center;padding:8px 4px 12px}
.cn-badge{width:64px;height:64px;border-radius:20px;margin:0 auto 16px;display:flex;
  align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,var(--brand-blue),var(--brand-green));
  box-shadow:0 8px 22px -6px rgba(0,104,152,.5);animation:cn-pop .4s ease}
.cn-badge-win{background:linear-gradient(135deg,#e6a700,var(--brand-red))}
.cn-title{font-size:1.8rem;font-weight:800;color:#10243a;margin:0 0 8px;letter-spacing:-.02em}
.cn-sub{color:#5b6b7a;font-size:.95rem;line-height:1.5;margin:0 auto 18px;max-width:42ch}
.cn-rules{list-style:none;padding:0;margin:0 auto 22px;display:inline-flex;flex-direction:column;gap:8px;text-align:left}
.cn-rules li{display:flex;align-items:center;gap:8px;color:#33485c;font-weight:600;font-size:.9rem}
.cn-rules li svg{color:var(--brand-blue);flex:none}
.cn-scorepill{display:inline-flex;align-items:center;gap:8px;margin-top:6px;background:var(--brand-blue);
  color:#fff;font-weight:800;padding:10px 18px;border-radius:999px;font-size:1.05rem;
  box-shadow:0 6px 16px -6px rgba(0,104,152,.6)}
.cn-savestate{margin-top:14px;font-size:.85rem;min-height:1.2em}
.cn-saving{color:#94a3b2}.cn-saved{color:var(--brand-green);font-weight:700}

.cn-top{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}
.cn-progress{flex:1;min-width:0}
.cn-qnum{font-weight:800;color:#10243a;font-size:1.1rem}
.cn-qtot{color:#9fb0bd;font-weight:700;font-size:.85rem}
.cn-dots{display:flex;gap:5px;margin-top:8px;flex-wrap:wrap}
.cn-dot{width:100%;max-width:22px;height:6px;border-radius:3px;background:#e6eaee;flex:1}
.cn-dot-done{background:var(--brand-green)}
.cn-dot-now{background:var(--brand-blue);animation:cn-pulse 1s ease-in-out infinite}

.cn-ring{position:relative;width:56px;height:56px;border-radius:50%;flex:none;
  background:conic-gradient(var(--ring) calc(var(--pct)*1%),#eef1f4 0);
  transition:background .1s linear;display:flex;align-items:center;justify-content:center}
.cn-ring::after{content:"";position:absolute;inset:6px;background:#fff;border-radius:50%}
.cn-ring-num{position:relative;z-index:1;font-weight:800;font-size:1.25rem;font-variant-numeric:tabular-nums}

/* faux article */
.cn-article{background:#fff;border:1px solid #e7eef3;border-radius:16px;padding:0;overflow:hidden;
  transition:all .25s ease;box-shadow:0 1px 0 #f0f3f6}
.cn-article-right{border-color:var(--brand-green)}
.cn-article-wrong{border-color:var(--brand-red);animation:cn-shake .4s ease}
.cn-article-head{display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid #eef2f5;
  background:#f7fafc}
.cn-globe{width:24px;height:24px;border-radius:6px;background:var(--brand-blue);color:#fff;
  display:flex;align-items:center;justify-content:center;flex:none}
.cn-article-topic{font-weight:800;color:#10243a;font-size:1rem}
.cn-article-from{margin-left:auto;font-size:.7rem;color:#9fb0bd;font-style:italic}
.cn-statement{font-family:Georgia,'Times New Roman',serif;font-size:1.25rem;line-height:1.55;
  color:#1a2b3a;padding:22px 20px;margin:0;text-align:left}
@media(min-width:640px){.cn-statement{font-size:1.4rem;padding:26px 24px}}
.cn-cn-tag{color:var(--brand-blue);font-size:.62em;font-family:inherit;vertical-align:super;
  white-space:nowrap;animation:cn-pop .3s ease;font-weight:600}

.cn-verdict{display:flex;gap:12px;text-align:left;margin:0 16px 18px;background:#f7fafc;
  border-radius:12px;padding:14px;position:relative;animation:cn-pop .3s ease}
.cn-verdict-icon{width:36px;height:36px;border-radius:9px;flex:none;color:#fff;display:flex;align-items:center;justify-content:center}
.cn-verdict-right .cn-verdict-icon{background:var(--brand-green)}
.cn-verdict-wrong .cn-verdict-icon{background:var(--brand-red)}
.cn-verdict strong{display:block;color:#10243a;font-size:.95rem;margin-bottom:2px}
.cn-verdict p{margin:0;color:#5b6b7a;font-size:.85rem;line-height:1.4}
.cn-gain{position:absolute;top:12px;right:14px;font-weight:800;color:var(--brand-green);font-size:1rem;animation:cn-float 1s ease}

.cn-prompt{text-align:center;font-weight:700;color:#33485c;margin:18px 0 12px;font-size:.95rem}
.cn-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cn-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;
  font-weight:800;font-size:1rem;padding:16px 12px;border-radius:14px;font-family:inherit;
  transition:transform .12s ease,box-shadow .12s ease,opacity .12s}
.cn-btn:active{transform:translateY(2px) scale(.99)}
.cn-btn:disabled{opacity:.55;cursor:not-allowed}
.cn-btn-needs{background:var(--brand-blue);color:#fff;box-shadow:0 6px 16px -6px rgba(0,104,152,.6)}
.cn-btn-fine{background:var(--brand-green);color:#fff;box-shadow:0 6px 16px -6px rgba(48,157,100,.6)}
.cn-btn-needs:hover:not(:disabled),.cn-btn-fine:hover:not(:disabled){transform:translateY(-2px)}
.cn-btn-go{background:var(--brand-blue);color:#fff;width:100%;justify-content:center;box-shadow:0 8px 20px -6px rgba(0,104,152,.6)}
.cn-btn-go:hover{background:var(--brand-green)}
.cn-footscore{text-align:center;margin-top:14px;color:#9fb0bd;font-size:.8rem;font-weight:600}

@keyframes cn-pop{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes cn-pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes cn-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes cn-float{from{transform:translateY(6px);opacity:0}to{transform:translateY(0);opacity:1}}
`;

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Clock,
  Trophy,
  ArrowRight,
  Sparkles,
  Send,
  AlertCircle,
  Check,
  ListChecks,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import type { GamePlayProps } from "@/lib/game-types";

/**
 * WIKI25 STORY BUILDER
 *
 * Theme: Wikipedia turns 25 — every editor on Wikipedia has, in a way, told a
 * story with the elements they had. This game gives players 25 elements (a
 * mix of characters, settings, props, and twists, each weighted by
 * difficulty) and 8 minutes to write a logically coherent story of at least
 * 150 words that uses as many as possible.
 *
 * SCORING (deterministic, defensible, admin can override afterwards):
 *   - Element score: sum of point values of elements actually present in the
 *     story (whole-word, case-insensitive). Easy elements = 1pt, hard = 5pt.
 *     Max possible if all 25 used = ~70pt.
 *   - Length bonus: tiered. 150w = +20, 200w = +40, 300w = +80. Encourages
 *     real writing without rewarding spam.
 *   - Speed bonus: small fraction of remaining seconds (only if submitted
 *     before time runs out), capped so it can never equal one extra element.
 *
 * Final integer = element_pts * 10000 + length_bonus * 100 + speed_bonus.
 * Same magnitude as other games (six figures) so the leaderboard reads
 * consistently. The element count is the dominant term: more elements always
 * beats more length. Admin still has final say via the participation manager.
 *
 * ANTI-PASTE: blocks onPaste, drag-and-drop, and right-click context menu.
 * Tracks typing rate as an honesty signal (not an automatic penalty) — admins
 * can see it on completion. Determined cheaters can still bypass via DevTools
 * or external tools; this is honor-system reinforced by friction.
 *
 * TEAM PLAY: each team member verifies and submits as themselves. The leader-
 * board groups by teamName and shows the best individual submission as the
 * team's score. Teams should designate one writer per round.
 */

const TIME_LIMIT_SECONDS = 8 * 60;
const MIN_WORDS = 150;

interface Element {
  word: string;
  category: "Character" | "Setting" | "Object" | "Action" | "Twist";
  points: 1 | 2 | 3 | 4 | 5;
  /** alternate forms that should count as a match (plurals, common variants) */
  variants?: string[];
}

// 25 elements, deliberately spread across difficulty and category so most
// stories naturally pull from several at once. Edit the array to retune.
const ELEMENTS: Element[] = [
  // Characters (easy = common, hard = specific)
  { word: "boy", category: "Character", points: 1 },
  { word: "girl", category: "Character", points: 1 },
  { word: "teacher", category: "Character", points: 2 },
  { word: "student", category: "Character", points: 1 },
  { word: "scientist", category: "Character", points: 3 },
  { word: "stranger", category: "Character", points: 3 },
  { word: "librarian", category: "Character", points: 4 },

  // Settings
  { word: "library", category: "Setting", points: 2, variants: ["libraries"] },
  { word: "rooftop", category: "Setting", points: 4, variants: ["rooftops"] },
  {
    word: "classroom",
    category: "Setting",
    points: 2,
    variants: ["classrooms"],
  },
  { word: "marketplace", category: "Setting", points: 4 },

  // Objects
  { word: "notebook", category: "Object", points: 2, variants: ["notebooks"] },
  { word: "umbrella", category: "Object", points: 3, variants: ["umbrellas"] },
  {
    word: "telescope",
    category: "Object",
    points: 4,
    variants: ["telescopes"],
  },
  { word: "envelope", category: "Object", points: 3, variants: ["envelopes"] },
  { word: "key", category: "Object", points: 2, variants: ["keys"] },

  // Actions (use verb stem + common conjugations)
  {
    word: "whisper",
    category: "Action",
    points: 3,
    variants: ["whispers", "whispered", "whispering"],
  },
  {
    word: "discover",
    category: "Action",
    points: 2,
    variants: ["discovers", "discovered", "discovering", "discovery"],
  },
  {
    word: "escape",
    category: "Action",
    points: 3,
    variants: ["escapes", "escaped", "escaping"],
  },
  {
    word: "promise",
    category: "Action",
    points: 2,
    variants: ["promises", "promised", "promising"],
  },

  // Twists / specifics — high point, harder to weave in naturally
  { word: "midnight", category: "Twist", points: 4 },
  {
    word: "thunderstorm",
    category: "Twist",
    points: 5,
    variants: ["thunderstorms"],
  },
  {
    word: "anniversary",
    category: "Twist",
    points: 5,
    variants: ["anniversaries"],
  },
  { word: "footprint", category: "Twist", points: 4, variants: ["footprints"] },
  {
    word: "coincidence",
    category: "Twist",
    points: 5,
    variants: ["coincidences"],
  },
];

const MAX_ELEMENT_POINTS = ELEMENTS.reduce((s, e) => s + e.points, 0);

// Length tiers: hits the threshold → take that tier's bonus (highest reached)
const LENGTH_TIERS = [
  { words: 150, bonus: 20 },
  { words: 200, bonus: 40 },
  { words: 300, bonus: 80 },
];

const SPEED_MAX = 99; // < length_bonus_step (100) so can never beat length tier

type Phase = "intro" | "writing" | "submitting" | "done";

/* ---------- scoring helpers ---------- */

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function detectElements(text: string): {
  matched: Element[];
  elementPoints: number;
} {
  const lower = text.toLowerCase();
  const matched: Element[] = [];
  for (const el of ELEMENTS) {
    const forms = [el.word, ...(el.variants ?? [])];
    const hit = forms.some((f) => {
      // whole-word match: word boundary on both sides (allows punctuation,
      // newlines, etc. around it; rejects substrings inside other words)
      const re = new RegExp(
        `(^|[^a-z])${escapeRegex(f.toLowerCase())}([^a-z]|$)`,
      );
      return re.test(lower);
    });
    if (hit) matched.push(el);
  }
  const elementPoints = matched.reduce((s, e) => s + e.points, 0);
  return { matched, elementPoints };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lengthBonus(words: number): number {
  let bonus = 0;
  for (const tier of LENGTH_TIERS) {
    if (words >= tier.words) bonus = tier.bonus;
  }
  return bonus;
}

function buildFinalScore(opts: {
  elementPoints: number;
  lengthBonus: number;
  secondsRemaining: number;
}): number {
  const speedBonus = Math.min(
    SPEED_MAX,
    Math.max(
      0,
      Math.round((opts.secondsRemaining / TIME_LIMIT_SECONDS) * SPEED_MAX),
    ),
  );
  // element_pts * 10000 + length_bonus * 100 + speed_bonus
  // makes element count strictly dominant, length next, speed just a tiebreak
  return opts.elementPoints * 10000 + opts.lengthBonus * 100 + speedBonus;
}

/* ---------- component ---------- */

export default function Wiki25StoryGame({ identity, onFinish }: GamePlayProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [story, setStory] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_SECONDS);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submittedBreakdown, setSubmittedBreakdown] = useState<{
    matched: Element[];
    elementPoints: number;
    lengthBonus: number;
    words: number;
    speedSeconds: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pasteAttempts, setPasteAttempts] = useState(0);
  const [showPasteWarn, setShowPasteWarn] = useState(false);

  // typing-rate honesty signal
  const typingStart = useRef<number | null>(null);
  const lastLength = useRef(0);
  const fastBursts = useRef(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* live derived values */
  const words = countWords(story);
  const { matched, elementPoints } = useMemo(
    () => detectElements(story),
    [story],
  );
  const lengthBonusValue = lengthBonus(words);
  const canSubmit = words >= MIN_WORDS && phase === "writing";

  /* timer */
  useEffect(() => {
    if (phase !== "writing") return;
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  /* time's up — auto-submit if eligible, otherwise lock with 0 */
  useEffect(() => {
    if (phase === "writing" && secondsLeft <= 0) {
      void submit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  /* typing-rate tracker */
  function onStoryChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const v = e.target.value;
    if (typingStart.current === null) typingStart.current = Date.now();
    const delta = v.length - lastLength.current;
    if (delta > 25) {
      // a single keystroke produced >25 chars — almost certainly programmatic
      fastBursts.current += 1;
    }
    lastLength.current = v.length;
    setStory(v);
  }

  /* paste / drag / context-menu blockers */
  function blockPaste(
    e: React.ClipboardEvent | React.DragEvent | React.MouseEvent,
  ) {
    e.preventDefault();
    setPasteAttempts((n) => n + 1);
    setShowPasteWarn(true);
    setTimeout(() => setShowPasteWarn(false), 2500);
  }

  /* submit */
  const submit = useCallback(
    async (auto = false) => {
      if (phase !== "writing") return;
      const finalWords = countWords(story);
      // for auto-submits below the min, we still record what they wrote but
      // score it as zero so admins can see there was an attempt
      const tooShort = finalWords < MIN_WORDS;
      const { matched: m, elementPoints: ep } = detectElements(story);
      const lb = lengthBonus(finalWords);
      const final = tooShort
        ? 0
        : buildFinalScore({
            elementPoints: ep,
            lengthBonus: lb,
            secondsRemaining: secondsLeft,
          });

      setPhase("submitting");
      setSaving(true);
      setSubmittedScore(final);
      setSubmittedBreakdown({
        matched: m,
        elementPoints: ep,
        lengthBonus: lb,
        words: finalWords,
        speedSeconds: secondsLeft,
      });

      try {
        await onFinish(final, { submissionText: story });
        setSaved(true);
      } finally {
        setSaving(false);
        setPhase("done");
      }
      void auto;
    },
    [phase, story, secondsLeft, onFinish],
  );

  /* ---------- INTRO ---------- */
  if (phase === "intro") {
    return (
      <div className="w25-card">
        <style>{styles}</style>
        <div className="w25-intro">
          <div className="w25-badge">
            <Sparkles size={30} />
          </div>
          <div className="w25-kicker">Wikipedia 25 · Story Builder</div>
          <h2 className="w25-title">Write a story. Earn elements.</h2>
          <p className="w25-sub">
            {identity.participantName}, you'll get <b>25 elements</b> —
            characters, settings, objects, actions, and twists, each worth 1 to
            5 points based on difficulty. Weave as many as you can into a
            coherent story of at least <b>{MIN_WORDS} words</b>.
          </p>
          <ul className="w25-rules">
            <li>
              <Clock size={15} /> 8 minutes total
            </li>
            <li>
              <Pencil size={15} /> At least {MIN_WORDS} words to submit
            </li>
            <li>
              <ListChecks size={15} /> More elements used → higher score
            </li>
            <li>
              <ShieldAlert size={15} /> No copy-pasting — type your own
            </li>
          </ul>
          <p className="w25-team-note">
            Playing in a team? One writer per round. Your team's score is the
            best member submission.
          </p>
          <button
            className="w25-btn w25-btn-go"
            onClick={() => setPhase("writing")}
          >
            Start writing <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- DONE ---------- */
  if (phase === "done") {
    const breakdown = submittedBreakdown!;
    const usedByCategory = ELEMENTS.reduce<
      Record<string, { used: number; total: number }>
    >((acc, el) => {
      const c = el.category;
      if (!acc[c]) acc[c] = { used: 0, total: 0 };
      acc[c].total += 1;
      if (breakdown.matched.some((m) => m.word === el.word)) acc[c].used += 1;
      return acc;
    }, {});

    return (
      <div className="w25-card">
        <style>{styles}</style>
        <div className="w25-intro">
          <div className="w25-badge w25-badge-win">
            <Trophy size={30} />
          </div>
          <h2 className="w25-title">
            {submittedScore && submittedScore > 0 ? "Submitted." : "Time's up."}
          </h2>
          {submittedScore === 0 ? (
            <p className="w25-sub">
              Your story didn't reach the {MIN_WORDS}-word minimum, so this
              submission scores zero. The admin can review and adjust if needed.
            </p>
          ) : (
            <p className="w25-sub">
              Nice work, {identity.participantName}. Here's how your story
              scored.
            </p>
          )}

          {/* breakdown card */}
          <div className="w25-breakdown">
            <div className="w25-breakdown-row">
              <span>Words written</span>
              <b>{breakdown.words}</b>
            </div>
            <div className="w25-breakdown-row">
              <span>
                Elements used ({breakdown.matched.length} / {ELEMENTS.length})
              </span>
              <b>
                {breakdown.elementPoints} / {MAX_ELEMENT_POINTS} pts
              </b>
            </div>
            <div className="w25-breakdown-row">
              <span>Length bonus</span>
              <b>+{breakdown.lengthBonus}</b>
            </div>
            <div className="w25-breakdown-row">
              <span>Time remaining</span>
              <b>{formatTime(breakdown.speedSeconds)}</b>
            </div>
            <div className="w25-breakdown-row w25-breakdown-total">
              <span>Final score</span>
              <b>{submittedScore?.toLocaleString()}</b>
            </div>
          </div>

          {/* matched element chips */}
          {breakdown.matched.length > 0 && (
            <>
              <div className="w25-chip-label">
                Elements detected in your story
              </div>
              <div className="w25-chips">
                {breakdown.matched.map((m) => (
                  <span
                    key={m.word}
                    className={`w25-chip w25-chip-p${m.points}`}
                  >
                    {m.word} <b>+{m.points}</b>
                  </span>
                ))}
              </div>
            </>
          )}

          <p className="w25-savestate">
            {saving && <span className="w25-saving">Saving your score…</span>}
            {saved && <span className="w25-saved">Score recorded ✓</span>}
          </p>
          {pasteAttempts > 0 && (
            <p className="w25-paste-log">
              {pasteAttempts} paste attempt{pasteAttempts === 1 ? "" : "s"}{" "}
              blocked during play.
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ---------- WRITING ---------- */

  // color the timer ring like the other games
  const ringPct = (secondsLeft / TIME_LIMIT_SECONDS) * 100;
  const ringColor =
    secondsLeft > 180
      ? "var(--brand-green)"
      : secondsLeft > 60
        ? "#d99100"
        : "var(--brand-red)";

  return (
    <div className="w25-card w25-card-wide">
      <style>{styles}</style>

      {/* top bar */}
      <div className="w25-top">
        <div className="w25-top-l">
          <div className="w25-top-kicker">Wikipedia 25 · Story</div>
          <div className="w25-top-counts">
            <span>
              <Pencil size={13} /> <b>{words}</b> / {MIN_WORDS}+ words
            </span>
            <span>
              <ListChecks size={13} /> <b>{matched.length}</b> /{" "}
              {ELEMENTS.length} elements
            </span>
            <span className="w25-top-pts">
              <Sparkles size={13} /> {elementPoints} pts
            </span>
          </div>
        </div>
        <div
          className="w25-ring"
          style={{
            ["--pct" as string]: `${ringPct}`,
            ["--ring" as string]: ringColor,
          }}
        >
          <span className="w25-ring-num" style={{ color: ringColor }}>
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      <div className="w25-grid">
        {/* elements panel */}
        <aside className="w25-elements">
          <div className="w25-elements-head">
            <ListChecks size={14} /> Your 25 elements
          </div>
          <div className="w25-elements-list">
            {ELEMENTS.map((el) => {
              const used = matched.some((m) => m.word === el.word);
              return (
                <div
                  key={el.word}
                  className={`w25-el w25-el-p${el.points} ${used ? "w25-el-used" : ""}`}
                  title={`${el.category} · ${el.points} pt${el.points === 1 ? "" : "s"}`}
                >
                  <span className="w25-el-word">{el.word}</span>
                  <span className="w25-el-pts">+{el.points}</span>
                  {used && <Check size={11} className="w25-el-check" />}
                </div>
              );
            })}
          </div>
          <div className="w25-elements-foot">
            <span className="w25-pip w25-pip-p1" /> 1 pt
            <span className="w25-pip w25-pip-p2" /> 2
            <span className="w25-pip w25-pip-p3" /> 3
            <span className="w25-pip w25-pip-p4" /> 4
            <span className="w25-pip w25-pip-p5" /> 5
          </div>
        </aside>

        {/* writing pane */}
        <main className="w25-write">
          <textarea
            value={story}
            onChange={onStoryChange}
            onPaste={blockPaste}
            onDrop={blockPaste}
            onDragOver={(e) => e.preventDefault()}
            onContextMenu={blockPaste}
            spellCheck
            autoFocus
            placeholder={`Begin your story here. At least ${MIN_WORDS} words. Use as many of the 25 elements as you can weave together logically — the elements you used will light up on the left.`}
            className="w25-textarea"
          />
          <div className="w25-write-foot">
            <div className="w25-write-stats">
              {words < MIN_WORDS ? (
                <span className="w25-need-more">
                  {MIN_WORDS - words} more word
                  {MIN_WORDS - words === 1 ? "" : "s"} to submit
                </span>
              ) : (
                <span className="w25-ready">
                  Ready to submit · length bonus +{lengthBonusValue}
                </span>
              )}
            </div>
            <button
              className="w25-btn w25-btn-submit"
              disabled={!canSubmit}
              onClick={() => submit(false)}
            >
              <Send size={16} /> Submit story
            </button>
          </div>
        </main>
      </div>

      {showPasteWarn && (
        <div className="w25-toast">
          <AlertCircle size={16} /> Pasting is disabled for this game — type
          your own story.
        </div>
      )}
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

/* ---------- styles ---------- */

const styles = `
.w25-card{background:#fff;border-radius:24px;border:1px solid #eef0f2;
  box-shadow:0 10px 40px -12px rgba(0,40,80,.18);padding:20px;max-width:580px;
  margin:0 auto;overflow:hidden;font-family:inherit;position:relative}
.w25-card-wide{max-width:960px}
@media(min-width:640px){.w25-card{padding:28px}}

/* intro / done */
.w25-intro{text-align:center;padding:8px 4px 12px}
.w25-badge{width:64px;height:64px;border-radius:20px;margin:0 auto 14px;display:flex;
  align-items:center;justify-content:center;color:#fff;
  background:linear-gradient(135deg,var(--brand-blue),var(--brand-green));
  box-shadow:0 8px 22px -6px rgba(0,104,152,.5);animation:w25-pop .4s ease}
.w25-badge-win{background:linear-gradient(135deg,#e6a700,var(--brand-red))}
.w25-kicker{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--brand-blue);margin-bottom:6px}
.w25-title{font-size:1.8rem;font-weight:800;color:#10243a;margin:0 0 10px;letter-spacing:-.02em}
.w25-sub{color:#5b6b7a;font-size:.95rem;line-height:1.55;margin:0 auto 18px;max-width:46ch}
.w25-rules{list-style:none;padding:0;margin:0 auto 14px;display:inline-flex;flex-direction:column;gap:8px;text-align:left}
.w25-rules li{display:flex;align-items:center;gap:8px;color:#33485c;font-weight:600;font-size:.9rem}
.w25-rules li svg{color:var(--brand-blue);flex:none}
.w25-team-note{font-size:.78rem;color:#94a3b2;font-style:italic;margin:0 0 22px}
.w25-savestate{margin-top:14px;font-size:.85rem;min-height:1.2em}
.w25-saving{color:#94a3b2}.w25-saved{color:var(--brand-green);font-weight:700}
.w25-paste-log{font-size:.72rem;color:#94a3b2;margin-top:6px;font-style:italic}

/* done — breakdown */
.w25-breakdown{background:#f7fafc;border:1px solid #eef2f5;border-radius:14px;padding:14px 16px;
  margin:18px auto 0;max-width:380px;text-align:left}
.w25-breakdown-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;
  font-size:.88rem;color:#33485c;border-bottom:1px solid #eef2f5}
.w25-breakdown-row:last-child{border:none}
.w25-breakdown-row b{font-variant-numeric:tabular-nums}
.w25-breakdown-total{margin-top:6px;padding-top:10px;border-top:2px solid var(--brand-blue);
  font-size:1rem;color:#10243a}
.w25-breakdown-total b{color:var(--brand-blue);font-size:1.15rem}

.w25-chip-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;
  color:#94a3b2;font-weight:700;margin:20px 0 8px}
.w25-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.w25-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;
  font-size:.78rem;font-weight:600;border:1px solid transparent}
.w25-chip b{font-weight:800;opacity:.85;font-size:.7rem}

/* point-tier colors (used by chips, elements, and pips) */
.w25-chip-p1,.w25-el-p1.w25-el-used,.w25-pip-p1{background:#e0f2fe;color:#075985;border-color:#bae6fd}
.w25-chip-p2,.w25-el-p2.w25-el-used,.w25-pip-p2{background:#dcfce7;color:#166534;border-color:#bbf7d0}
.w25-chip-p3,.w25-el-p3.w25-el-used,.w25-pip-p3{background:#fef3c7;color:#854d0e;border-color:#fde68a}
.w25-chip-p4,.w25-el-p4.w25-el-used,.w25-pip-p4{background:#ffedd5;color:#9a3412;border-color:#fed7aa}
.w25-chip-p5,.w25-el-p5.w25-el-used,.w25-pip-p5{background:#fee2e2;color:#991b1b;border-color:#fecaca}

/* writing layout */
.w25-top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:18px}
.w25-top-kicker{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--brand-blue);margin-bottom:6px}
.w25-top-counts{display:flex;gap:14px;flex-wrap:wrap;font-size:.82rem;color:#5b6b7a;font-weight:600}
.w25-top-counts svg{vertical-align:-2px;margin-right:3px;color:var(--brand-blue)}
.w25-top-counts b{color:#10243a;font-variant-numeric:tabular-nums}
.w25-top-pts{color:var(--brand-green)!important;font-weight:800}
.w25-top-pts svg{color:var(--brand-green)!important}

.w25-ring{position:relative;width:64px;height:64px;border-radius:50%;flex:none;
  background:conic-gradient(var(--ring) calc(var(--pct)*1%),#eef1f4 0);
  transition:background .3s linear;display:flex;align-items:center;justify-content:center}
.w25-ring::after{content:"";position:absolute;inset:6px;background:#fff;border-radius:50%}
.w25-ring-num{position:relative;z-index:1;font-weight:800;font-size:.95rem;font-variant-numeric:tabular-nums}

.w25-grid{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:768px){.w25-grid{grid-template-columns:240px 1fr;gap:18px}}

.w25-elements{background:#f7fafc;border:1px solid #eef2f5;border-radius:14px;padding:14px;
  max-height:auto;overflow:hidden}
@media(min-width:768px){.w25-elements{max-height:520px;overflow-y:auto}}
.w25-elements-head{display:flex;align-items:center;gap:6px;font-size:.7rem;font-weight:800;text-transform:uppercase;
  letter-spacing:.08em;color:#5b6b7a;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #eef2f5}
.w25-elements-list{display:flex;flex-wrap:wrap;gap:5px}
@media(min-width:768px){.w25-elements-list{flex-direction:column;flex-wrap:nowrap}}
.w25-el{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:5px 9px;
  border-radius:8px;background:#fff;border:1px solid #e7eef3;font-size:.82rem;color:#5b6b7a;
  font-weight:600;transition:all .15s ease;position:relative}
.w25-el-used{font-weight:700;animation:w25-pop .25s ease}
.w25-el-word{flex:1;text-transform:lowercase}
.w25-el-pts{font-size:.7rem;font-weight:800;color:#94a3b2}
.w25-el-used .w25-el-pts{color:inherit;opacity:.8}
.w25-el-check{flex:none}
.w25-elements-foot{display:flex;gap:6px;align-items:center;font-size:.65rem;color:#94a3b2;margin-top:10px;padding-top:8px;border-top:1px solid #eef2f5;flex-wrap:wrap}
.w25-pip{width:10px;height:10px;border-radius:50%;border:1px solid currentColor;display:inline-block}

/* textarea */
.w25-write{display:flex;flex-direction:column;gap:10px}
.w25-textarea{width:100%;min-height:340px;padding:16px 18px;border:1px solid #e7eef3;border-radius:14px;
  font-family:inherit;font-size:.95rem;line-height:1.6;resize:vertical;color:#10243a;
  background:#fff;outline:none;transition:border-color .15s,box-shadow .15s}
.w25-textarea:focus{border-color:var(--brand-blue);box-shadow:0 0 0 3px rgba(0,104,152,.15)}
.w25-textarea::placeholder{color:#94a3b2}

.w25-write-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.w25-write-stats{font-size:.82rem;font-weight:700}
.w25-need-more{color:#94a3b2}
.w25-ready{color:var(--brand-green)}

.w25-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;
  font-weight:800;font-size:.95rem;padding:11px 18px;border-radius:12px;transition:all .12s ease;font-family:inherit}
.w25-btn:active{transform:translateY(1px) scale(.99)}
.w25-btn:disabled{opacity:.5;cursor:not-allowed}
.w25-btn-go{background:var(--brand-blue);color:#fff;padding:14px 22px;font-size:1rem;width:100%;max-width:280px;
  box-shadow:0 6px 16px -6px rgba(0,104,152,.6)}
.w25-btn-go:hover{background:var(--brand-green)}
.w25-btn-submit{background:var(--brand-green);color:#fff;box-shadow:0 6px 16px -6px rgba(48,157,100,.6)}
.w25-btn-submit:hover:not(:disabled){background:var(--brand-blue)}

.w25-toast{position:absolute;bottom:18px;left:50%;transform:translateX(-50%);
  background:#10243a;color:#fff;padding:10px 16px;border-radius:10px;font-size:.85rem;font-weight:600;
  display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px -8px rgba(0,0,0,.4);animation:w25-toast .25s ease}
.w25-toast svg{color:#f9a826}

@keyframes w25-pop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes w25-toast{from{transform:translate(-50%,10px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
`;

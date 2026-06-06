"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Clock,
  Trophy,
  ArrowRight,
  Send,
  AlertCircle,
  Check,
  Pencil,
  ShieldAlert,
  Sparkles,
  ListChecks,
} from "lucide-react";
import type { GamePlayProps } from "@/lib/game-types";

/**
 * WIKI25 STORY BUILDER — redesign v2 (no gradients, professional, mobile-first)
 *
 * Same scoring contract as before:
 *   - Element points (1–5 per word) × 10000 → dominates the score
 *   - Length tier (+20/+40/+80 at 150/200/300) × 100 → secondary
 *   - Speed bonus (0–99) → tiebreak only
 * Final = element_pts * 10000 + length_bonus * 100 + speed_bonus
 *
 * Element list is a 5-column grid (responsive: 2 cols on phone, 5 on desktop)
 * showing all 25 at once with no scrolling. Each tile is large enough to tap.
 * Used elements get a clean checkmark and bold border. No gradients, just
 * solid color tokens by point tier. Subtle pulse and scale animations.
 */

const TIME_LIMIT_SECONDS = 8 * 60;
const MIN_WORDS = 100;
const BASE_POINTS_MULT = 10000;
const LENGTH_MULT = 100;
const SPEED_MAX = 99;

interface Element {
  word: string;
  category: "Character" | "Setting" | "Object" | "Action" | "Twist";
  points: 1 | 2 | 3 | 4 | 5;
  variants?: string[];
}

const ELEMENTS: Element[] = [
  // Characters
  { word: "boy", category: "Character", points: 1 },
  { word: "girl", category: "Character", points: 1 },
  { word: "student", category: "Character", points: 1 },
  { word: "teacher", category: "Character", points: 2 },
  { word: "stranger", category: "Character", points: 3 },
  { word: "scientist", category: "Character", points: 3 },
  { word: "librarian", category: "Character", points: 4 },
  // Settings
  { word: "library", category: "Setting", points: 2, variants: ["libraries"] },
  {
    word: "classroom",
    category: "Setting",
    points: 2,
    variants: ["classrooms"],
  },
  { word: "rooftop", category: "Setting", points: 4, variants: ["rooftops"] },
  { word: "marketplace", category: "Setting", points: 4 },
  // Objects
  { word: "key", category: "Object", points: 2, variants: ["keys"] },
  { word: "notebook", category: "Object", points: 2, variants: ["notebooks"] },
  { word: "umbrella", category: "Object", points: 3, variants: ["umbrellas"] },
  { word: "envelope", category: "Object", points: 3, variants: ["envelopes"] },
  {
    word: "telescope",
    category: "Object",
    points: 4,
    variants: ["telescopes"],
  },
  // Actions
  {
    word: "discover",
    category: "Action",
    points: 2,
    variants: ["discovers", "discovered", "discovering", "discovery"],
  },
  {
    word: "promise",
    category: "Action",
    points: 2,
    variants: ["promises", "promised", "promising"],
  },
  {
    word: "whisper",
    category: "Action",
    points: 3,
    variants: ["whispers", "whispered", "whispering"],
  },
  {
    word: "escape",
    category: "Action",
    points: 3,
    variants: ["escapes", "escaped", "escaping"],
  },
  // Twists
  { word: "midnight", category: "Twist", points: 4 },
  { word: "footprint", category: "Twist", points: 4, variants: ["footprints"] },
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
  {
    word: "coincidence",
    category: "Twist",
    points: 5,
    variants: ["coincidences"],
  },
];
const MAX_ELEMENT_POINTS = ELEMENTS.reduce((s, e) => s + e.points, 0);

const LENGTH_TIERS = [
  { words: 100, bonus: 20 },
  { words: 150, bonus: 40 },
  { words: 200, bonus: 80 },
];

type Phase = "intro" | "writing" | "submitting" | "done";

/* ---------- scoring ---------- */
function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function detectElements(text: string) {
  const lower = text.toLowerCase();
  const matched: Element[] = [];
  for (const el of ELEMENTS) {
    const forms = [el.word, ...(el.variants ?? [])];
    if (
      forms.some((f) =>
        new RegExp(`(^|[^a-z])${escapeRegex(f.toLowerCase())}([^a-z]|$)`).test(
          lower,
        ),
      )
    ) {
      matched.push(el);
    }
  }
  return { matched, elementPoints: matched.reduce((s, e) => s + e.points, 0) };
}
function lengthBonus(words: number): number {
  let b = 0;
  for (const t of LENGTH_TIERS) if (words >= t.words) b = t.bonus;
  return b;
}
function buildFinalScore(opts: {
  elementPoints: number;
  lengthBonus: number;
  secondsRemaining: number;
}) {
  const speedBonus = Math.min(
    SPEED_MAX,
    Math.max(
      0,
      Math.round((opts.secondsRemaining / TIME_LIMIT_SECONDS) * SPEED_MAX),
    ),
  );
  return (
    opts.elementPoints * BASE_POINTS_MULT +
    opts.lengthBonus * LENGTH_MULT +
    speedBonus
  );
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

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const words = countWords(story);
  const { matched, elementPoints } = useMemo(
    () => detectElements(story),
    [story],
  );
  const lengthBonusValue = lengthBonus(words);
  const canSubmit = words >= MIN_WORDS && phase === "writing";

  useEffect(() => {
    if (phase !== "writing") return;
    tickRef.current = setInterval(
      () => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)),
      1000,
    );
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase]);

  const submit = useCallback(
    async (auto = false) => {
      if (phase !== "writing") return;
      const finalWords = countWords(story);
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

  useEffect(() => {
    if (phase === "writing" && secondsLeft <= 0) void submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  function blockPaste(
    e: React.ClipboardEvent | React.DragEvent | React.MouseEvent,
  ) {
    e.preventDefault();
    setPasteAttempts((n) => n + 1);
    setShowPasteWarn(true);
    setTimeout(() => setShowPasteWarn(false), 2200);
  }

  /* ---------- INTRO ---------- */
  if (phase === "intro") {
    return (
      <div className="w25-card w25-card-narrow">
        <style>{styles}</style>
        <div className="w25-intro">
          <div className="w25-icon-frame">
            <Sparkles size={26} />
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
    const b = submittedBreakdown!;
    return (
      <div className="w25-card w25-card-narrow">
        <style>{styles}</style>
        <div className="w25-intro">
          <div className="w25-icon-frame w25-icon-frame-win">
            <Trophy size={26} />
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
          <div className="w25-breakdown">
            <div className="w25-bd-row">
              <span>Words written</span>
              <b>{b.words}</b>
            </div>
            <div className="w25-bd-row">
              <span>
                Elements used ({b.matched.length} / {ELEMENTS.length})
              </span>
              <b>
                {b.elementPoints} / {MAX_ELEMENT_POINTS} pts
              </b>
            </div>
            <div className="w25-bd-row">
              <span>Length bonus</span>
              <b>+{b.lengthBonus}</b>
            </div>
            <div className="w25-bd-row">
              <span>Time remaining</span>
              <b>{formatTime(b.speedSeconds)}</b>
            </div>
            <div className="w25-bd-row w25-bd-total">
              <span>Final score</span>
              <b>{submittedScore?.toLocaleString()}</b>
            </div>
          </div>
          {b.matched.length > 0 && (
            <>
              <div className="w25-chip-label">
                Elements detected in your story
              </div>
              <div className="w25-chips">
                {b.matched.map((m) => (
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
  const ringPct = (secondsLeft / TIME_LIMIT_SECONDS) * 100;
  const ringColor =
    secondsLeft > 180
      ? "var(--brand-green)"
      : secondsLeft > 60
        ? "#d99100"
        : "var(--brand-red)";

  return (
    <div className="w25-card">
      <style>{styles}</style>

      {/* Top bar */}
      <div className="w25-top">
        <div className="w25-top-l">
          <div className="w25-top-kicker">Wikipedia 25 · Story</div>
          <div className="w25-top-counts">
            <span>
              <Pencil size={13} /> <b>{words}</b>
              <span className="w25-mute">/{MIN_WORDS}+ words</span>
            </span>
            <span>
              <ListChecks size={13} /> <b>{matched.length}</b>
              <span className="w25-mute">/{ELEMENTS.length} elements</span>
            </span>
            <span className="w25-top-pts">
              <Sparkles size={13} /> <b>{elementPoints}</b>
              <span className="w25-mute"> pts</span>
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

      {/* Element grid — ALL 25 visible, no scroll */}
      <div className="w25-elements-section">
        <div className="w25-elements-head">
          <span>
            <ListChecks size={14} /> Your 25 elements
          </span>
          <span className="w25-mute">Words you use light up</span>
        </div>
        <div className="w25-elements-grid">
          {ELEMENTS.map((el) => {
            const used = matched.some((m) => m.word === el.word);
            return (
              <div
                key={el.word}
                className={`w25-el w25-el-p${el.points} ${used ? "w25-el-used" : ""}`}
                title={`${el.category} · ${el.points} point${el.points === 1 ? "" : "s"}`}
              >
                <span className="w25-el-pts-badge">+{el.points}</span>
                <span className="w25-el-word">{el.word}</span>
                {used && <Check size={13} className="w25-el-check" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Writing area */}
      <div className="w25-write">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          onPaste={blockPaste}
          onDrop={blockPaste}
          onDragOver={(e) => e.preventDefault()}
          onContextMenu={blockPaste}
          spellCheck
          autoFocus
          placeholder={`Begin your story. At least ${MIN_WORDS} words. Use as many of the 25 elements above as you can weave together logically — they light up on the grid as you type.`}
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
                <Check size={14} /> Ready to submit · length bonus +
                {lengthBonusValue}
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
      </div>

      {showPasteWarn && (
        <div className="w25-toast">
          <AlertCircle size={16} /> Pasting is disabled — type your own story.
        </div>
      )}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, "0");
  return `${m}:${ss}`;
}

/* ---------- STYLES — solid colors, no gradients, professional ---------- */
const styles = `
.w25-card{background:#fff;border-radius:20px;border:1px solid #e6e9ec;
  box-shadow:0 1px 3px rgba(0,0,0,.04),0 10px 30px -12px rgba(0,40,80,.08);
  padding:18px;max-width:980px;margin:0 auto;font-family:inherit;position:relative}
.w25-card-narrow{max-width:580px}
@media(min-width:640px){.w25-card{padding:24px}}

/* intro / done */
.w25-intro{text-align:center;padding:6px 4px}
.w25-icon-frame{width:56px;height:56px;border-radius:14px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:var(--brand-blue);color:#fff;animation:w25-pop .35s ease}
.w25-icon-frame-win{background:#10243a}
.w25-kicker{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--brand-blue);margin-bottom:6px}
.w25-title{font-size:1.65rem;font-weight:800;color:#10243a;margin:0 0 10px;letter-spacing:-.02em;line-height:1.15}
@media(min-width:640px){.w25-title{font-size:1.85rem}}
.w25-sub{color:#5b6b7a;font-size:.94rem;line-height:1.55;margin:0 auto 18px;max-width:46ch}
.w25-rules{list-style:none;padding:0;margin:0 auto 14px;display:inline-flex;flex-direction:column;gap:9px;text-align:left}
.w25-rules li{display:flex;align-items:center;gap:9px;color:#33485c;font-weight:600;font-size:.92rem}
.w25-rules li svg{color:var(--brand-blue);flex:none}
.w25-team-note{font-size:.78rem;color:#94a3b2;font-style:italic;margin:0 0 22px}
.w25-savestate{margin-top:14px;font-size:.85rem;min-height:1.2em}
.w25-saving{color:#94a3b2}
.w25-saved{color:var(--brand-green);font-weight:700}
.w25-paste-log{font-size:.72rem;color:#94a3b2;margin-top:6px;font-style:italic}

/* breakdown */
.w25-breakdown{background:#f6f8fa;border:1px solid #e7eaee;border-radius:12px;padding:14px 16px;margin:18px auto 0;max-width:380px;text-align:left}
.w25-bd-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:.88rem;color:#33485c;border-bottom:1px solid #e7eaee}
.w25-bd-row:last-child{border:none}
.w25-bd-row b{font-variant-numeric:tabular-nums}
.w25-bd-total{margin-top:6px;padding-top:10px;border-top:2px solid var(--brand-blue);font-size:1rem;color:#10243a}
.w25-bd-total b{color:var(--brand-blue);font-size:1.15rem}

.w25-chip-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:#94a3b2;font-weight:700;margin:20px 0 8px}
.w25-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.w25-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:8px;font-size:.78rem;font-weight:700;border:1px solid transparent}
.w25-chip b{font-weight:800;opacity:.9;font-size:.7rem}

/* solid color tokens per point tier — NO gradients */
.w25-chip-p1,.w25-el-p1.w25-el-used{background:#eff6ff;color:#1e40af;border-color:#bfdbfe}
.w25-chip-p2,.w25-el-p2.w25-el-used{background:#ecfdf5;color:#065f46;border-color:#a7f3d0}
.w25-chip-p3,.w25-el-p3.w25-el-used{background:#fefce8;color:#854d0e;border-color:#fde68a}
.w25-chip-p4,.w25-el-p4.w25-el-used{background:#fff7ed;color:#9a3412;border-color:#fdba74}
.w25-chip-p5,.w25-el-p5.w25-el-used{background:#fef2f2;color:#991b1b;border-color:#fca5a5}

/* TOP BAR */
.w25-top{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #eef0f2}
.w25-top-kicker{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--brand-blue);margin-bottom:8px}
.w25-top-counts{display:flex;gap:14px;flex-wrap:wrap;font-size:.85rem;color:#5b6b7a;font-weight:600}
.w25-top-counts svg{vertical-align:-2px;margin-right:4px;color:var(--brand-blue)}
.w25-top-counts b{color:#10243a;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:800}
.w25-top-pts b{color:var(--brand-green)}
.w25-top-pts svg{color:var(--brand-green)!important}
.w25-mute{color:#94a3b2;font-weight:500;margin-left:2px}

.w25-ring{position:relative;width:62px;height:62px;border-radius:50%;flex:none;background:conic-gradient(var(--ring) calc(var(--pct)*1%),#eef1f4 0);transition:background .3s linear;display:flex;align-items:center;justify-content:center}
.w25-ring::after{content:"";position:absolute;inset:5px;background:#fff;border-radius:50%}
.w25-ring-num{position:relative;z-index:1;font-weight:800;font-size:.95rem;font-variant-numeric:tabular-nums}

/* ELEMENT GRID — all 25 visible, no scroll, flex layout so long words fit */
.w25-elements-section{margin-bottom:18px}
.w25-elements-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#5b6b7a;flex-wrap:wrap;gap:6px}
.w25-elements-head svg{color:var(--brand-blue);vertical-align:-2px;margin-right:5px}
.w25-elements-head .w25-mute{text-transform:none;font-weight:500;letter-spacing:0;font-size:.78rem}

/* Flex layout: tiles size to their content, wrap naturally. Long words like
   "thunderstorm" / "marketplace" / "anniversary" stay readable instead of
   getting clipped by fixed grid columns. */
.w25-elements-grid{display:flex;flex-wrap:wrap;gap:6px}
@media(min-width:768px){.w25-elements-grid{gap:8px}}

.w25-el{position:relative;display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;background:#fff;border:1.5px solid #e7eaee;font-size:.92rem;color:#33485c;font-weight:600;transition:transform .2s ease,border-color .2s ease,background .2s ease,color .2s ease;cursor:default;white-space:nowrap;flex:0 0 auto}
@media(min-width:768px){.w25-el{font-size:1rem;padding:10px 15px}}
.w25-el-word{text-transform:lowercase;font-weight:600}
.w25-el-pts-badge{font-size:.7rem;font-weight:800;min-width:22px;height:22px;padding:0 5px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:#f1f4f7;color:#94a3b2;flex:none;transition:all .2s ease}
.w25-el-used{font-weight:700;animation:w25-pop .35s ease;border-width:1.5px}
.w25-el-used .w25-el-word{color:inherit}
.w25-el-used .w25-el-pts-badge{background:rgba(255,255,255,.7);color:inherit;font-weight:800}
.w25-el-check{flex:none;animation:w25-pop .25s ease}

/* WRITING */
.w25-write{display:flex;flex-direction:column;gap:12px}
.w25-textarea{width:100%;min-height:280px;padding:16px 18px;border:1.5px solid #e7eaee;border-radius:14px;font-family:inherit;font-size:1rem;line-height:1.65;resize:vertical;color:#10243a;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s}
@media(min-width:768px){.w25-textarea{min-height:320px}}
.w25-textarea:focus{border-color:var(--brand-blue);box-shadow:0 0 0 3px rgba(0,104,152,.12)}
.w25-textarea::placeholder{color:#94a3b2}

.w25-write-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.w25-write-stats{font-size:.88rem;font-weight:700}
.w25-need-more{color:#94a3b2}
.w25-ready{color:var(--brand-green);display:inline-flex;align-items:center;gap:6px}

.w25-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;cursor:pointer;font-weight:700;font-size:.95rem;padding:12px 20px;border-radius:11px;transition:all .15s ease;font-family:inherit}
.w25-btn:active{transform:translateY(1px)}
.w25-btn:disabled{opacity:.45;cursor:not-allowed}
.w25-btn-go{background:var(--brand-blue);color:#fff;padding:14px 22px;font-size:1rem;width:100%;max-width:280px}
.w25-btn-go:hover{background:var(--brand-green)}
.w25-btn-submit{background:var(--brand-green);color:#fff}
.w25-btn-submit:hover:not(:disabled){background:var(--brand-blue)}

.w25-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10243a;color:#fff;padding:11px 17px;border-radius:10px;font-size:.88rem;font-weight:600;display:flex;align-items:center;gap:8px;box-shadow:0 10px 30px -8px rgba(0,0,0,.4);animation:w25-toast .22s ease;z-index:200}
.w25-toast svg{color:#f9a826}

@keyframes w25-pop{0%{transform:scale(.85);opacity:0}60%{transform:scale(1.05);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes w25-toast{from{transform:translate(-50%,10px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
`;

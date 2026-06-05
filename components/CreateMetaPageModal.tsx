"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, BookOpen, Copy, Check, Info } from "lucide-react";

/**
 * CreateMetaPageModal
 *
 * Collects a few details (Wiki username, real name, country, optional about)
 * and opens Meta-Wiki's edit form for the user's user page with the wikitext
 * pre-filled. The {{User WOL}} template + a personalised intro paragraph are
 * inserted via the `text=` URL parameter so it works whether their page
 * already exists or not (preload= only works on new pages, text= always
 * works).
 *
 * IMPORTANT: For the {{User WOL}} userbox to actually render on Meta-Wiki,
 * the template must exist at meta.wikimedia.org/wiki/Template:User_WOL.
 * Until you create it, the wikitext will display as a red link "{{User WOL}}"
 * on saved pages. The plain prose still shows fine in the meantime. The
 * wikitext to paste on Meta to create the template is below this component's
 * comments.
 */

interface Props {
  eventName: string;
  open: boolean;
  onClose: () => void;
}

const COUNTRIES = [
  "India",
  "Bangladesh",
  "Pakistan",
  "Nepal",
  "Sri Lanka",
  "Indonesia",
  "Philippines",
  "Nigeria",
  "Ghana",
  "Kenya",
  "Egypt",
  "Brazil",
  "Argentina",
  "Mexico",
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Other",
];

function buildWikitext(opts: {
  username: string;
  realName: string;
  country: string;
  event?: string;
}): string {
  const { username, realName, country, event } = opts;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // The wikitext template — uses {{User WOL}} userbox (must exist on Meta)
  // followed by a personalised "about me" prose paragraph. The userbox
  // floats right by convention; the prose flows around it.
  return `<!-- This page was started with the Wiki Open Learning create-your-page tool. -->
<!-- Edit anything below to make it your own, then click "Publish changes". -->

{{User WOL}}

== About me ==

My name is '''${realName}''' and I edit on Wikimedia projects as [[User:${username}|${username}]].
I am from '''${country}'''.

I am a member of [[m:Wiki Open Learning|Wiki Open Learning]], an open Wikimedia community initiative focused on learning, participation, and capacity building across Wikimedia projects.${event ? ` I joined the community through the ''${event}'' event.` : ""}

== Interests ==

* Wikipedia editing
* Wikimedia Commons
* Community events and workshops

== Contact ==

Reach me via my [[User talk:${username}|talk page]].

----

''Member of [[m:Wiki Open Learning|Wiki Open Learning]] since ${today}.''

[[Category:Wiki Open Learning members]]
`;
}

export default function CreateMetaPageModal({
  eventName,
  open,
  onClose,
}: Props) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [country, setCountry] = useState("India");
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

  // close on Escape, lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const usernameClean = username.trim();
  const realNameClean = realName.trim();
  const valid = usernameClean.length >= 2 && realNameClean.length >= 2;

  const wikitext = buildWikitext({
    username: usernameClean || "YourUsername",
    realName: realNameClean || "Your Name",
    country,
    event: eventName,
  });

  const metaUrl = `https://meta.wikimedia.org/w/index.php?title=User:${encodeURIComponent(
    usernameClean,
  )}&action=edit&summary=${encodeURIComponent(
    "Created my user page with the Wiki Open Learning tool",
  )}&preloadtitle=&text=${encodeURIComponent(wikitext)}`;

  const handleOpen = () => {
    setTouched(true);
    if (!valid) return;
    window.open(metaUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    setTouched(true);
    try {
      await navigator.clipboard.writeText(wikitext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // older browsers — fall back to silent no-op
    }
  };

  const input =
    "w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition text-sm";
  const label =
    "block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmp-title"
    >
      <div
        className="relative bg-white w-full sm:w-[36rem] max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-blue to-brand-green text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 id="cmp-title" className="font-bold leading-tight">
                Create your Meta-Wiki page
              </h2>
              <p className="text-xs text-white/80 leading-tight mt-0.5">
                We'll preload the wikitext — you just click Publish.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* body (scrollable) */}
        <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 flex-1">
          {/* Wiki username */}
          <div>
            <label className={label} htmlFor="cmp-username">
              Wikimedia username *
            </label>
            <input
              id="cmp-username"
              className={input}
              placeholder="e.g. MeeraW"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">
              Your existing Wikimedia account username (no User: prefix).
            </p>
          </div>

          {/* Real name */}
          <div>
            <label className={label} htmlFor="cmp-name">
              Your name *
            </label>
            <input
              id="cmp-name"
              className={input}
              placeholder="e.g. Meera Singh"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
          </div>

          {/* Country */}
          <div>
            <label className={label} htmlFor="cmp-country">
              Country
            </label>
            <select
              id="cmp-country"
              className={input}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* validation hint */}
          {touched && !valid && (
            <div className="text-xs text-brand-red bg-red-50 border border-red-100 rounded-lg p-3">
              Please fill in your username and name.
            </div>
          )}

          {/* preview */}
          <details className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <summary className="px-4 py-3 text-sm font-semibold text-gray-700 cursor-pointer select-none flex items-center justify-between hover:bg-gray-100">
              <span className="flex items-center gap-2">
                <Info size={14} /> Preview the wikitext
              </span>
              <span className="text-xs text-gray-400">click to expand</span>
            </summary>
            <pre className="text-[11px] leading-relaxed bg-white border-t border-gray-100 p-4 overflow-x-auto font-mono text-gray-700 max-h-48">
              {wikitext}
            </pre>
          </details>

          {/* explanation */}
          <div className="text-xs text-gray-500 leading-relaxed bg-blue-50/40 border border-blue-100/60 rounded-lg p-3">
            <p className="font-semibold text-brand-blue mb-1 flex items-center gap-1.5">
              <Info size={13} /> How this works
            </p>
            <p>
              Clicking <b>Open on Meta-Wiki</b> opens the edit form for{" "}
              <code className="bg-white px-1 rounded">
                User:{usernameClean || "YourUsername"}
              </code>{" "}
              with this wikitext already filled in. Review the content, then
              click "Publish changes" on Meta to save it.
            </p>
            <p className="mt-2 text-gray-500">
              If you already have a user page, the prefilled text appears in the
              editor — copy the parts you want into your existing page instead
              of overwriting.
            </p>
          </div>
        </div>

        {/* footer / actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            {copied ? (
              <>
                <Check size={16} className="text-brand-green" /> Copied!
              </>
            ) : (
              <>
                <Copy size={16} /> Copy wikitext
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleOpen}
            disabled={!valid}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-blue text-white font-bold text-sm hover:bg-brand-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink size={16} /> Open on Meta-Wiki
          </button>
        </div>
      </div>
    </div>
  );
}

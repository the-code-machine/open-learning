"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Info,
  Search,
} from "lucide-react";
import {
  listParticipants,
  getParticipant,
  getEventParticipants,
  buildMetaWikitext,
  buildMetaEditUrl,
} from "@/lib/participants";

/**
 * CreateMetaPageModal — event-aware version.
 *
 * Looks up the eventId in /data/participants.json. If we have participants
 * for that event, the user picks themselves from a searchable dropdown and
 * the wikitext is auto-filled from their CSV data (photo, city, school,
 * interests, etc.). If we don't have participant data for an event, the modal
 * falls back to the previous free-form flow.
 *
 * The user still has to provide their Wikimedia username because the edit URL
 * targets User:Username and most attendees don't have an account yet at
 * registration time — they create one at the event.
 *
 * Adding another event later = append another top-level key to
 * /data/participants.json. No code change needed.
 */

interface Props {
  eventId: string;
  eventName: string;
  open: boolean;
  onClose: () => void;
}

export default function CreateMetaPageModal({
  eventId,
  eventName,
  open,
  onClose,
}: Props) {
  const event = useMemo(() => getEventParticipants(eventId), [eventId]);
  const allParticipants = useMemo(() => listParticipants(eventId), [eventId]);

  const hasParticipantData = event !== null && allParticipants.length > 0;

  // Form state
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [search, setSearch] = useState("");
  const [username, setUsername] = useState("");
  const [fallbackName, setFallbackName] = useState("");
  const [fallbackCity, setFallbackCity] = useState("");
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedSlug("");
      setSearch("");
      setUsername("");
      setFallbackName("");
      setFallbackCity("");
      setCopied(false);
      setTouched(false);
    }
  }, [open]);

  // Escape to close + lock body scroll
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

  // Auto-prefill username if the participant already has a Wikimedia account
  useEffect(() => {
    if (!selectedSlug || !event) return;
    const p = getParticipant(eventId, selectedSlug);
    if (p?.wikiUsername && !username) {
      setUsername(p.wikiUsername);
    }
  }, [selectedSlug, eventId, event, username]);

  if (!open) return null;

  const selectedParticipant = selectedSlug
    ? getParticipant(eventId, selectedSlug)
    : null;
  const filtered = search
    ? allParticipants.filter((p) =>
        p.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : allParticipants;

  const usernameClean = username.trim();
  // Need a username always. If using data file, name is from participant.
  // Otherwise we need both name AND username from the user.
  const valid = hasParticipantData
    ? usernameClean.length >= 2 && selectedSlug.length > 0
    : usernameClean.length >= 2 && fallbackName.trim().length >= 2;

  const wikitext = event
    ? buildMetaWikitext({
        event,
        participant: selectedParticipant,
        username: usernameClean || "YourUsername",
        fallbackName: fallbackName || undefined,
        fallbackCity: fallbackCity || undefined,
      })
    : "";

  const handleOpen = () => {
    setTouched(true);
    if (!valid) return;
    const url = buildMetaEditUrl(usernameClean, wikitext);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    setTouched(true);
    try {
      await navigator.clipboard.writeText(wikitext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* older browsers */
    }
  };

  const input =
    "w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 outline-none transition text-sm";
  const label =
    "block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5";

  // No event data at all — show graceful fallback
  if (!event) {
    return (
      <Shell onClose={onClose} title="Create your Meta-Wiki page" sub="">
        <div className="px-5 sm:px-6 py-8 text-center text-sm text-gray-500">
          This event doesn&apos;t have participant data loaded. Ask the event
          organisers to add it, or check{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            /data/participants.json
          </code>
          .
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      onClose={onClose}
      title="Create your Meta-Wiki page"
      sub="Find yourself, add your username, click Publish on Meta-Wiki."
    >
      <div className="overflow-y-auto px-5 sm:px-6 py-5 space-y-4 flex-1">
        {/* Event card */}
        <div className="bg-blue-50/40 border border-blue-100/60 rounded-lg p-3 text-xs">
          <p className="font-bold text-brand-blue mb-0.5">For event</p>
          <p className="text-gray-700">
            {event.eventShortName} · {event.eventDate}
          </p>
        </div>

        {hasParticipantData ? (
          <>
            {/* Searchable participant picker */}
            <div>
              <label className={label}>
                Who are you? *{" "}
                <span className="text-gray-400 font-normal normal-case">
                  {allParticipants.length} registered participants
                </span>
              </label>
              <div className="relative mb-2">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  className={input + " pl-9"}
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-4">
                    No matches. Adjust your search.
                  </p>
                ) : (
                  filtered.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setSelectedSlug(p.slug)}
                      className={
                        "w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 " +
                        (selectedSlug === p.slug
                          ? "bg-blue-50 text-brand-blue font-semibold"
                          : "text-gray-700")
                      }
                    >
                      {selectedSlug === p.slug && (
                        <Check size={14} className="text-brand-green" />
                      )}
                      <span className={selectedSlug === p.slug ? "" : "ml-5"}>
                        {p.fullName}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Participant preview */}
            {selectedParticipant && (
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-3 text-xs space-y-1">
                <p className="font-bold text-gray-700">
                  {selectedParticipant.fullName}
                </p>
                {selectedParticipant.city && (
                  <p className="text-gray-500">
                    From {selectedParticipant.city}
                    {selectedParticipant.school
                      ? ` · ${selectedParticipant.school}`
                      : ""}
                  </p>
                )}
                {selectedParticipant.interests.length > 0 && (
                  <p className="text-gray-500">
                    Interests:{" "}
                    {selectedParticipant.interests.slice(0, 3).join(", ")}
                    {selectedParticipant.interests.length > 3 ? "…" : ""}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          // Free-form fallback
          <>
            <div>
              <label className={label}>Your name *</label>
              <input
                className={input}
                placeholder="e.g. Meera Singh"
                value={fallbackName}
                onChange={(e) => setFallbackName(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>City</label>
              <input
                className={input}
                placeholder="e.g. Vidisha"
                value={fallbackCity}
                onChange={(e) => setFallbackCity(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Wikimedia username — required regardless */}
        <div>
          <label className={label}>Wikimedia username *</label>
          <input
            className={input}
            placeholder="e.g. MeeraW (no User: prefix)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            {selectedParticipant?.wikiUsername
              ? "Pre-filled from your registration."
              : "If you don&apos;t have a Wikimedia account yet, create one first at wikipedia.org and come back."}
          </p>
        </div>

        {touched && !valid && (
          <div className="text-xs text-brand-red bg-red-50 border border-red-100 rounded-lg p-3">
            {hasParticipantData
              ? "Please pick yourself from the list and enter your Wikimedia username."
              : "Please enter your name and Wikimedia username."}
          </div>
        )}

        {/* Wikitext preview */}
        <details className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
          <summary className="px-4 py-3 text-sm font-semibold text-gray-700 cursor-pointer select-none flex items-center justify-between hover:bg-gray-100">
            <span className="flex items-center gap-2">
              <Info size={14} /> Preview the wikitext
            </span>
            <span className="text-xs text-gray-400">click to expand</span>
          </summary>
          <pre className="text-[11px] leading-relaxed bg-white border-t border-gray-100 p-4 overflow-x-auto font-mono text-gray-700 max-h-56">
            {wikitext || "Select yourself to preview…"}
          </pre>
        </details>

        <div className="text-xs text-gray-500 leading-relaxed bg-blue-50/40 border border-blue-100/60 rounded-lg p-3">
          <p className="font-semibold text-brand-blue mb-1 flex items-center gap-1.5">
            <Info size={13} /> How this works
          </p>
          <p>
            Clicking <b>Open on Meta-Wiki</b> opens the edit form for{" "}
            <code className="bg-white px-1 rounded">
              User:{usernameClean || "YourUsername"}
            </code>{" "}
            with this wikitext already filled in. Review and click &quot;Publish
            changes&quot; on Meta.
          </p>
          <p className="mt-2 text-gray-500">
            If you already have a user page, the prefilled text appears in the
            editor — copy the parts you want into your existing page instead of
            overwriting.
          </p>
        </div>
      </div>

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
    </Shell>
  );
}

/* Shared modal shell */
function Shell({
  onClose,
  title,
  sub,
  children,
}: {
  onClose: () => void;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white w-full sm:w-[36rem] max-h-[92vh] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-brand-blue text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold leading-tight">{title}</h2>
              {sub && (
                <p className="text-xs text-white/80 leading-tight mt-0.5">
                  {sub}
                </p>
              )}
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
        {children}
      </div>
    </div>
  );
}

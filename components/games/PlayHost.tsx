"use client";

import { useState } from "react";
import { UserCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { getRegistryEntry } from "@/components/games/registry";
import type { PlayIdentity } from "@/lib/game-types";

/**
 * Loginless but identity-checked play host.
 *
 * The player enters their email or phone (private, not public). We verify it
 * against the SELECTED roster for this game+event via /api/verify-player before
 * the game starts. Only a verified, selected participant can play and record a
 * score. The score is later posted with the same contact, and /api/score
 * re-checks it server-side. Name is never typed — it is resolved from the
 * contact, so nobody can play as someone else.
 */
export default function PlayHost({
  gameId,
  eventId,
  componentKey,
}: {
  gameId: string;
  eventId: string;
  componentKey: string;
}) {
  const [identity, setIdentity] = useState<PlayIdentity | null>(null);
  const [contact, setContact] = useState("");
  const [verifiedContact, setVerifiedContact] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entry = getRegistryEntry(componentKey);

  if (!entry) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
        No playable component is mapped to{" "}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded">
          {componentKey}
        </code>
        .
      </div>
    );
  }

  async function verify() {
    setError(null);
    if (!contact.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/verify-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, eventId, contact }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(
          data.error ??
            "We couldn't find you on the selected roster for this game.",
        );
        return;
      }
      setVerifiedContact(contact.trim());
      setIdentity({
        participantName: data.participantName,
        participantWiki: data.participantWiki ?? undefined,
        teamName: data.teamName ?? undefined,
      });
    } catch {
      setError("Network error while verifying. Try again.");
    } finally {
      setChecking(false);
    }
  }

  async function recordScore(score: number) {
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          eventId,
          contact: verifiedContact,
          score,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save score.");
      }
    } catch {
      setError("Network error while saving score.");
    }
  }

  if (!identity) {
    const input =
      "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-3">
            <UserCircle2 size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify to play</h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter the email or phone you registered with. Only selected
            participants can record a score.
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-brand-red rounded-lg p-3 mb-3 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            className={input}
            placeholder="Email or phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            autoFocus
          />
          <button
            onClick={verify}
            disabled={checking || !contact.trim()}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors disabled:opacity-50"
          >
            <ShieldCheck size={18} /> {checking ? "Checking…" : "Verify & play"}
          </button>
        </div>
      </div>
    );
  }

  const Play = entry.Play;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2 bg-brand-green/10 text-brand-green rounded-lg px-4 py-2 text-sm font-semibold">
        <ShieldCheck size={16} /> Verified — playing as{" "}
        {identity.participantName}
      </div>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-brand-red rounded-lg p-3 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      <Play
        gameId={gameId}
        eventId={eventId}
        identity={identity}
        onFinish={recordScore}
      />
    </div>
  );
}

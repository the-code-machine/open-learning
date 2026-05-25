"use client";

import { useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle, X } from "lucide-react";
import { registerForEventAction } from "@/lib/actions";

type RegState = "ok" | "error" | "bademail" | null;

export default function JoinEventForm({
  eventId,
  games,
  regState,
}: {
  eventId: string;
  games: { id: string; title: string }[];
  regState?: RegState;
}) {
  const [open, setOpen] = useState(false);

  const input =
    "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";
  const label = "block text-sm font-semibold text-gray-700 mb-1";

  if (regState === "ok") {
    return (
      <div className="flex items-start gap-3 bg-brand-green/10 text-brand-green rounded-xl p-4">
        <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Application received</p>
          <p className="text-sm text-green-800">
            Thanks for applying. Your registration is under review — selected
            participants will appear on this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {(regState === "error" || regState === "bademail") && (
        <div className="flex items-center gap-2 bg-red-50 text-brand-red rounded-lg p-3 mb-3 text-sm">
          <AlertCircle size={16} />
          {regState === "bademail"
            ? "Please enter a valid email address."
            : "Please fill in your name and email."}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
        >
          <UserPlus size={18} /> Join this Event
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute -top-1 right-0 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <h3 className="font-bold text-gray-900 mb-4">Apply to join</h3>
          <form action={registerForEventAction} className="space-y-3">
            <input type="hidden" name="eventId" value={eventId} />
            <div>
              <label className={label}>Name *</label>
              <input name="name" required className={input} />
            </div>
            <div>
              <label className={label}>Email *</label>
              <input
                type="email"
                name="email"
                required
                className={input}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className={label}>Phone (optional)</label>
              <input
                name="phone"
                className={input}
                placeholder="For verifying you at play time"
              />
            </div>
            <div>
              <label className={label}>Wiki handle (optional)</label>
              <input
                name="wikiHandle"
                className={input}
                placeholder="Status_401"
              />
            </div>
            {games.length > 0 && (
              <div>
                <label className={label}>
                  Interested in a specific game? (optional)
                </label>
                <select name="gameId" defaultValue="" className={input}>
                  <option value="">Whole event</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={label}>Team preference (optional)</label>
              <input
                name="teamPreference"
                className={input}
                placeholder="Team name or teammates"
              />
            </div>
            <div>
              <label className={label}>Message (optional)</label>
              <textarea name="message" rows={3} className={input} />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
            >
              <UserPlus size={18} /> Submit Application
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

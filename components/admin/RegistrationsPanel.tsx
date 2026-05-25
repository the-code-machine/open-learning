import { Check, X, RotateCcw, Trash2, Mail, Inbox } from "lucide-react";
import type { RegistrationModel } from "@/lib/types";
import {
  setRegistrationStatusAction,
  deleteRegistrationAction,
} from "@/lib/actions";

function StatusActions({
  reg,
  eventId,
}: {
  reg: RegistrationModel;
  eventId: string;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {reg.status !== "selected" && (
        <form action={setRegistrationStatusAction}>
          <input type="hidden" name="id" value={reg.id} />
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="selected" />
          <button
            className="p-2 rounded-lg text-brand-green hover:bg-brand-green/10 transition-colors"
            title="Approve (select)"
          >
            <Check size={16} />
          </button>
        </form>
      )}
      {reg.status !== "rejected" && (
        <form action={setRegistrationStatusAction}>
          <input type="hidden" name="id" value={reg.id} />
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="rejected" />
          <button
            className="p-2 rounded-lg text-brand-red hover:bg-red-50 transition-colors"
            title="Reject"
          >
            <X size={16} />
          </button>
        </form>
      )}
      {reg.status !== "pending" && (
        <form action={setRegistrationStatusAction}>
          <input type="hidden" name="id" value={reg.id} />
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="status" value="pending" />
          <button
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            title="Reset to pending"
          >
            <RotateCcw size={16} />
          </button>
        </form>
      )}
      <form action={deleteRegistrationAction}>
        <input type="hidden" name="id" value={reg.id} />
        <input type="hidden" name="eventId" value={eventId} />
        <button
          className="p-2 rounded-lg text-gray-300 hover:text-brand-red hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}

function RegRow({
  reg,
  eventId,
  gameTitle,
}: {
  reg: RegistrationModel;
  eventId: string;
  gameTitle?: string;
}) {
  return (
    <li className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{reg.name}</p>
        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <Mail size={13} /> {reg.email}
          {reg.wikiHandle ? ` · ${reg.wikiHandle}` : ""}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {gameTitle ? `Game: ${gameTitle}` : "Whole event"}
          {reg.teamPreference ? ` · Team: ${reg.teamPreference}` : ""}
        </p>
        {reg.message && (
          <p className="text-sm text-gray-600 mt-1 italic">“{reg.message}”</p>
        )}
      </div>
      <StatusActions reg={reg} eventId={eventId} />
    </li>
  );
}

export default function RegistrationsPanel({
  eventId,
  registrations,
  gameTitleById,
}: {
  eventId: string;
  registrations: RegistrationModel[];
  gameTitleById: Record<string, string>;
}) {
  const pending = registrations.filter((r) => r.status === "pending");
  const selected = registrations.filter((r) => r.status === "selected");
  const rejected = registrations.filter((r) => r.status === "rejected");

  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Inbox size={18} className="text-brand-blue" /> Registrations
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            {pending.length} pending
          </span>
          <span className="bg-brand-green/10 text-brand-green px-2 py-1 rounded-full">
            {selected.length} selected
          </span>
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            {rejected.length} rejected
          </span>
        </div>
      </div>

      {registrations.length === 0 ? (
        <p className="text-sm text-gray-400">No applications yet.</p>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-amber-700 mb-1">Pending</h3>
              <ul className="divide-y divide-gray-100">
                {pending.map((r) => (
                  <RegRow
                    key={r.id}
                    reg={r}
                    eventId={eventId}
                    gameTitle={r.gameId ? gameTitleById[r.gameId] : undefined}
                  />
                ))}
              </ul>
            </div>
          )}
          {selected.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-brand-green mb-1">
                Selected
              </h3>
              <ul className="divide-y divide-gray-100">
                {selected.map((r) => (
                  <RegRow
                    key={r.id}
                    reg={r}
                    eventId={eventId}
                    gameTitle={r.gameId ? gameTitleById[r.gameId] : undefined}
                  />
                ))}
              </ul>
            </div>
          )}
          {rejected.length > 0 && (
            <details className="group">
              <summary className="text-sm font-bold text-gray-500 cursor-pointer">
                Rejected ({rejected.length})
              </summary>
              <ul className="divide-y divide-gray-100 mt-1">
                {rejected.map((r) => (
                  <RegRow
                    key={r.id}
                    reg={r}
                    eventId={eventId}
                    gameTitle={r.gameId ? gameTitleById[r.gameId] : undefined}
                  />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

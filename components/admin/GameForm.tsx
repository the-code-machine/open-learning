"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { GameModel } from "@/lib/types";

type RuleItem = { label: string; detail: string };

export interface RegistryOption {
  key: string;
  label: string;
  defaultMaxScore: number;
}

export default function GameForm({
  action,
  initial,
  components,
}: {
  action: (formData: FormData) => void;
  initial?: GameModel;
  components: RegistryOption[];
}) {
  const isEdit = Boolean(initial);
  const [rules, setRules] = useState<RuleItem[]>(
    initial?.rules.map((r) => ({ label: r.label, detail: r.detail })) ?? [],
  );
  const [componentKey, setComponentKey] = useState(initial?.componentKey ?? "");

  const input =
    "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";
  const label = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <form action={action} className="space-y-8">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Game details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Title *</label>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              className={input}
              placeholder="Wiki Quiz Bowl"
            />
          </div>
          {!isEdit && (
            <div className="sm:col-span-2">
              <label className={label}>
                Slug (URL id) — leave blank to auto-generate
              </label>
              <input name="id" className={input} placeholder="wiki-quiz" />
            </div>
          )}
          <div>
            <label className={label}>Type</label>
            <select
              name="type"
              defaultValue={initial?.type ?? "individual"}
              className={input}
            >
              <option value="individual">Individual</option>
              <option value="team">Team</option>
            </select>
          </div>
          <div>
            <label className={label}>Mode</label>
            <select
              name="mode"
              defaultValue={initial?.mode ?? "offline"}
              className={input}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className={label}>Default team size (team games)</label>
            <input
              type="number"
              name="defaultTeamSize"
              min={0}
              defaultValue={initial?.defaultTeamSize ?? 0}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Cover image URL (optional)</label>
            <input
              name="coverImage"
              defaultValue={initial?.coverImage ?? ""}
              className={input}
              placeholder="/images/game.jpg"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Description</label>
            <textarea
              name="description"
              defaultValue={initial?.description}
              rows={4}
              className={input}
              placeholder="How is this game played?"
            />
          </div>
        </div>
      </section>

      {/* RULES */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Rules & Scoring</h2>
          <button
            type="button"
            onClick={() => setRules([...rules, { label: "", detail: "" }])}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
        {rules.length === 0 ? (
          <p className="text-sm text-gray-400">None yet.</p>
        ) : (
          <div className="space-y-3">
            {rules.map((r, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-2 items-start"
              >
                <input
                  className={input + " sm:w-40"}
                  placeholder="Label (Scoring)"
                  value={r.label}
                  onChange={(e) => {
                    const next = [...rules];
                    next[i] = { ...next[i], label: e.target.value };
                    setRules(next);
                  }}
                />
                <input
                  className={input + " flex-1"}
                  placeholder="Detail"
                  value={r.detail}
                  onChange={(e) => {
                    const next = [...rules];
                    next[i] = { ...next[i], detail: e.target.value };
                    setRules(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setRules(rules.filter((_, x) => x !== i))}
                  className="p-2 text-gray-400 hover:text-brand-red transition-colors shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      <input type="hidden" name="rules" value={JSON.stringify(rules)} />

      {/* PLAYABLE COMPONENT (maps to a self-contained game component) */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-bold text-gray-900">Playable component</h2>
          <p className="text-sm text-gray-500 mt-1">
            Optional. Attach a built-in playable component to this game. The
            component owns its own questions, rules, and scoring; players reach
            it from the game roster page and their best score is recorded
            automatically.
          </p>
        </div>
        <div>
          <label className={label}>Component</label>
          <select
            name="componentKey"
            value={componentKey}
            onChange={(e) => setComponentKey(e.target.value)}
            className={input + " sm:max-w-sm"}
          >
            {components.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {componentKey === "" ? (
          <p className="text-xs text-gray-400">
            No component selected — this game is scored manually by an admin or
            judge.
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            Logic and content live inside the component code. To change
            questions or scoring, edit the component in{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              components/games/
            </code>
            .
          </p>
        )}
      </section>

      <button
        type="submit"
        className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
      >
        <Save size={18} /> {isEdit ? "Save Changes" : "Create Game"}
      </button>
    </form>
  );
}

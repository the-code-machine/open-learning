"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { EventModel } from "@/lib/types";

type TimelineItem = { time: string; title: string };
type Facilitator = { name: string; role: string; wiki: string };
type Organiser = { name: string; role: string };
type GalleryItem = { url: string; caption: string };
type LinkItem = { name: string; url: string };

export default function EventForm({
  action,
  initial,
}: {
  action: (formData: FormData) => void;
  initial?: EventModel;
}) {
  const isEdit = Boolean(initial);

  const [timeline, setTimeline] = useState<TimelineItem[]>(
    initial?.timeline.map((t) => ({ time: t.time, title: t.title })) ?? [],
  );
  const [facilitators, setFacilitators] = useState<Facilitator[]>(
    initial?.facilitators.map((f) => ({
      name: f.name,
      role: f.role ?? "",
      wiki: f.wiki ?? "",
    })) ?? [],
  );
  const [organisers, setOrganisers] = useState<Organiser[]>(
    initial?.organisers.map((o) => ({ name: o.name, role: o.role ?? "" })) ??
      [],
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(
    (initial?.gallery ?? []).map((g) => ({
      url: g.url,
      caption: g.caption ?? "",
    })),
  );
  const [links, setLinks] = useState<LinkItem[]>(
    (initial?.links ?? []).map((l) => ({ name: l.name, url: l.url })),
  );

  const input =
    "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition text-sm";
  const label = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <form action={action} className="space-y-8">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}

      {/* BASICS */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Basics</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Title *</label>
            <input
              name="title"
              required
              defaultValue={initial?.title}
              className={input}
              placeholder="Wiki Fest 2025"
            />
          </div>
          {!isEdit && (
            <div className="sm:col-span-2">
              <label className={label}>
                Slug (URL id) — leave blank to auto-generate
              </label>
              <input name="id" className={input} placeholder="wiki-fest-2025" />
            </div>
          )}
          <div>
            <label className={label}>Date</label>
            <input
              type="date"
              name="date"
              defaultValue={initial?.date}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Time (free text)</label>
            <input
              name="time"
              defaultValue={initial?.time}
              className={input}
              placeholder="09:00 AM - 6:00 PM"
            />
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
            <label className={label}>Status</label>
            <select
              name="status"
              defaultValue={initial?.status ?? "upcoming"}
              className={input}
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing (Live)</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div>
            <label className={label}>Category</label>
            <input
              name="category"
              defaultValue={initial?.category}
              className={input}
              placeholder="Hackathon"
            />
          </div>
          <div>
            <label className={label}>Location</label>
            <input
              name="location"
              defaultValue={initial?.location}
              className={input}
              placeholder="City Library Hall, Bhopal"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Cover image URL (optional)</label>
            <input
              name="coverImage"
              defaultValue={initial?.coverImage ?? ""}
              className={input}
              placeholder="/images/event.jpg or https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Details</label>
            <textarea
              name="details"
              defaultValue={initial?.details}
              rows={4}
              className={input}
              placeholder="What is this event about?"
            />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <RepeatSection
        title="Timeline / Schedule"
        items={timeline}
        onAdd={() => setTimeline([...timeline, { time: "", title: "" }])}
        onRemove={(i) => setTimeline(timeline.filter((_, x) => x !== i))}
        render={(item, i) => (
          <>
            <input
              className={input + " sm:w-40"}
              placeholder="10:00 AM"
              value={item.time}
              onChange={(e) => {
                const next = [...timeline];
                next[i] = { ...next[i], time: e.target.value };
                setTimeline(next);
              }}
            />
            <input
              className={input + " flex-1"}
              placeholder="What happens"
              value={item.title}
              onChange={(e) => {
                const next = [...timeline];
                next[i] = { ...next[i], title: e.target.value };
                setTimeline(next);
              }}
            />
          </>
        )}
      />
      <input type="hidden" name="timeline" value={JSON.stringify(timeline)} />

      {/* FACILITATORS */}
      <RepeatSection
        title="Facilitators / Mentors"
        items={facilitators}
        onAdd={() =>
          setFacilitators([...facilitators, { name: "", role: "", wiki: "" }])
        }
        onRemove={(i) =>
          setFacilitators(facilitators.filter((_, x) => x !== i))
        }
        render={(item, i) => (
          <>
            <input
              className={input + " flex-1"}
              placeholder="Name"
              value={item.name}
              onChange={(e) => {
                const next = [...facilitators];
                next[i] = { ...next[i], name: e.target.value };
                setFacilitators(next);
              }}
            />
            <input
              className={input + " sm:w-40"}
              placeholder="Role"
              value={item.role}
              onChange={(e) => {
                const next = [...facilitators];
                next[i] = { ...next[i], role: e.target.value };
                setFacilitators(next);
              }}
            />
            <input
              className={input + " sm:w-40"}
              placeholder="Wiki handle"
              value={item.wiki}
              onChange={(e) => {
                const next = [...facilitators];
                next[i] = { ...next[i], wiki: e.target.value };
                setFacilitators(next);
              }}
            />
          </>
        )}
      />
      <input
        type="hidden"
        name="facilitators"
        value={JSON.stringify(facilitators)}
      />

      {/* ORGANISERS */}
      <RepeatSection
        title="Organisers"
        items={organisers}
        onAdd={() => setOrganisers([...organisers, { name: "", role: "" }])}
        onRemove={(i) => setOrganisers(organisers.filter((_, x) => x !== i))}
        render={(item, i) => (
          <>
            <input
              className={input + " flex-1"}
              placeholder="Name / Org"
              value={item.name}
              onChange={(e) => {
                const next = [...organisers];
                next[i] = { ...next[i], name: e.target.value };
                setOrganisers(next);
              }}
            />
            <input
              className={input + " sm:w-40"}
              placeholder="Role"
              value={item.role}
              onChange={(e) => {
                const next = [...organisers];
                next[i] = { ...next[i], role: e.target.value };
                setOrganisers(next);
              }}
            />
          </>
        )}
      />
      <input
        type="hidden"
        name="organisers"
        value={JSON.stringify(organisers)}
      />

      {/* GALLERY */}
      <RepeatSection
        title="Gallery images"
        items={gallery}
        onAdd={() => setGallery([...gallery, { url: "", caption: "" }])}
        onRemove={(i) => setGallery(gallery.filter((_, x) => x !== i))}
        render={(item, i) => (
          <>
            <input
              className={input + " flex-1"}
              placeholder="Image URL (https://...)"
              value={item.url}
              onChange={(e) => {
                const next = [...gallery];
                next[i] = { ...next[i], url: e.target.value };
                setGallery(next);
              }}
            />
            <input
              className={input + " sm:w-56"}
              placeholder="Caption (optional)"
              value={item.caption}
              onChange={(e) => {
                const next = [...gallery];
                next[i] = { ...next[i], caption: e.target.value };
                setGallery(next);
              }}
            />
          </>
        )}
      />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />

      {/* LINKS */}
      <RepeatSection
        title="External links"
        items={links}
        onAdd={() => setLinks([...links, { name: "", url: "" }])}
        onRemove={(i) => setLinks(links.filter((_, x) => x !== i))}
        render={(item, i) => (
          <>
            <input
              className={input + " sm:w-56"}
              placeholder="Display name (e.g. Meta-Wiki page)"
              value={item.name}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], name: e.target.value };
                setLinks(next);
              }}
            />
            <input
              className={input + " flex-1"}
              placeholder="URL (https://...)"
              value={item.url}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], url: e.target.value };
                setLinks(next);
              }}
            />
          </>
        )}
      />
      <input type="hidden" name="links" value={JSON.stringify(links)} />

      <button
        type="submit"
        className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-green transition-colors"
      >
        <Save size={18} /> {isEdit ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}

function RepeatSection<T>({
  title,
  items,
  onAdd,
  onRemove,
  render,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (item: T, i: number) => React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900">
          {title}
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({items.length})
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-green transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">None yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row gap-2 items-start"
            >
              {render(item, i)}
              <button
                type="button"
                onClick={() => onRemove(i)}
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
  );
}

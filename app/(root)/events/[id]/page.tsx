import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  ArrowRight,
  User,
  Users2,
  Gamepad2,
  Building2,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import {
  getEventDetail,
  getAllEventIds,
  getSelectedRegistrations,
} from "@/lib/queries";
import JoinEventForm from "@/components/ui/JoinEventForm";
import CreateMetaPageCTA from "@/components/CreateMetaPageCTA";
import {
  ModeBadge,
  StatusBadge,
  GameTypeBadge,
  formatDate,
  brandGradient,
} from "@/components/ui/Badges";
import {
  fetchAllCommonsImagesForEvent,
  fetchCommonsImages,
} from "@/lib/commons";
import EventGallery from "@/components/EventGalleryPage";
export const dynamic = "force-dynamic";

// Pre-build known event pages; new ones still render on demand.
export async function generateStaticParams() {
  const ids = await getAllEventIds();
  return ids.map((id) => ({ id }));
}

export default async function EventDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reg?: string }>;
}) {
  const { id } = await params;
  const { reg } = await searchParams;
  const event = await getEventDetail(id);
  if (!event) notFound();
  const selected = await getSelectedRegistrations(id);
  const canJoin = event.status === "upcoming" || event.status === "ongoing";

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* HERO */}
      <section className="relative bg-brand-blue text-white py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/events"
            className="inline-flex items-center text-blue-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Calendar
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge status={event.status} />
                <span className="inline-block py-1 px-3 rounded bg-brand-green/20 border border-brand-green text-brand-green font-bold text-xs uppercase tracking-wide backdrop-blur-sm">
                  {event.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm md:text-base text-blue-100">
                <span className="flex items-center gap-2">
                  <Calendar size={18} /> {formatDate(event.date)}
                </span>
                {event.time && (
                  <span className="flex items-center gap-2">
                    <Clock size={18} /> {event.time}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={18} /> {event.location}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <ModeBadge mode={event.mode} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About the Event
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {event.details}
              </p>
            </div>

            {/* Games in this event */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Gamepad2 className="text-brand-blue" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">
                  Games & Activities
                </h2>
              </div>

              {event.games.length > 0 ? (
                <div className="space-y-4">
                  {event.games.map(({ game, note, participantCount }) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}/${event.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-blue hover:bg-blue-50/40 transition-colors group"
                    >
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brandGradient(
                          game.id,
                        )} flex items-center justify-center text-white shrink-0`}
                      >
                        <Gamepad2 size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                            {game.title}
                          </h4>
                          <GameTypeBadge type={game.type} />
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {note ? `${note} · ` : ""}
                          {participantCount}{" "}
                          {participantCount === 1
                            ? "participant"
                            : "participants"}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        className="text-gray-300 group-hover:text-brand-blue shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Games for this event will be announced soon.
                </p>
              )}
            </div>

            {/* Timeline */}
            {event.timeline.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Schedule
                </h2>
                <div className="space-y-6">
                  {event.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="w-24 shrink-0 text-sm font-bold text-gray-500 pt-1">
                        {item.time}
                      </div>
                      <div className="flex-1 pb-6 border-b border-gray-100 group-last:border-0 group-last:pb-0">
                        <h4 className="text-lg font-bold text-gray-900">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilitators */}
            {event.facilitators.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Facilitators & Mentors
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {event.facilitators.map((f, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue shrink-0">
                        <User size={24} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900">{f.name}</h4>
                        <p className="text-sm text-gray-500">
                          {f.role}
                          {f.wiki ? ` · ${f.wiki}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {/* Gallery — manual URLs + Commons categories */}
            {(event.gallery.length > 0 ||
              event.galleryCategories.length > 0) && (
              <EventGallery
                manual={event.gallery}
                commons={await Promise.all(
                  event.galleryCategories.map(async (cat) => {
                    const r = await fetchCommonsImages(cat, null);
                    return {
                      category: cat,
                      images: r.images,
                      next: r.next,
                      error: r.error,
                    };
                  }),
                )}
              />
            )}
          </div>

          {/* RIGHT sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Join / register */}
              {canJoin && (
                <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-brand-blue">
                  <JoinEventForm
                    eventId={event.id}
                    games={event.games.map((g) => ({
                      id: g.game.id,
                      title: g.game.title,
                    }))}
                    regState={(reg as "ok" | "error" | "bademail") ?? null}
                  />
                </div>
              )}

              {/* Selected participants */}
              {selected.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Selected Participants
                    <span className="text-gray-400 font-normal">
                      {" "}
                      ({selected.length})
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {selected.map((r) => (
                      <li key={r.id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green text-sm font-bold shrink-0">
                          {r.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {r.name}
                          </p>
                          {r.wikiHandle && (
                            <p className="text-xs text-gray-400 truncate">
                              {r.wikiHandle}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick facts */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-brand-green">
                <h3 className="font-bold text-gray-900 mb-4">Event Details</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Mode</span>
                    <ModeBadge mode={event.mode} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <StatusBadge status={event.status} />
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Games</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Gamepad2 size={15} /> {event.games.length}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-gray-500">Participants</span>
                    <span className="font-bold text-gray-900 flex items-center gap-1">
                      <Users2 size={15} />{" "}
                      {event.games.reduce((s, g) => s + g.participantCount, 0)}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Organisers */}
              {event.organisers.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 size={18} /> Organised by
                  </h3>
                  <div className="space-y-3">
                    {event.organisers.map((o, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold">
                          {o.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {o.name}
                          </p>
                          {o.role && (
                            <p className="text-xs text-gray-500">{o.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External links */}
              {event.links.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LinkIcon size={18} /> Useful links
                  </h3>
                  <ul className="space-y-2">
                    {event.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 text-sm text-gray-700 hover:text-brand-blue transition-colors py-1.5"
                        >
                          <ExternalLink
                            size={14}
                            className="text-gray-300 group-hover:text-brand-blue shrink-0"
                          />
                          <span className="font-semibold truncate flex-1">
                            {l.name || l.url}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA — create-your-Meta-page tool */}
      <CreateMetaPageCTA eventName={event.title} eventId={event.id} />
    </div>
  );
}

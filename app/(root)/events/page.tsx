import { getAllEvents, getEventsByStatus } from "@/lib/queries";
import EventCalendar from "@/components/ui/Eventcalendar";
import { EventCard } from "@/components/ui/Cards";
import { CalendarDays } from "lucide-react";

// Always read fresh from the DB (participations/events can change via admin).
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [allEvents, upcoming, past] = await Promise.all([
    getAllEvents(),
    getEventsByStatus("upcoming"),
    getEventsByStatus("past"),
  ]);

  // ongoing events show in the "upcoming" rail too
  const ongoing = allEvents.filter((e) => e.status === "ongoing");
  const upcomingAll = [...ongoing, ...upcoming];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO + CALENDAR */}
      <section className="bg-brand-blue text-white pt-12 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Community Calendar</h1>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Discover our workshops, hackathons, and meetups. Click a date to
              see what is happening, or browse every event below.
            </p>
          </div>
          {allEvents.length > 0 ? (
            <EventCalendar events={allEvents} />
          ) : (
            <div className="bg-white/10 rounded-2xl p-12 text-center text-blue-100">
              No events yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* UPCOMING */}
      {upcomingAll.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-12 border-b border-gray-200 pb-4">
            <div>
              <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
                Save the date
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                Upcoming Events
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingAll.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* PAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-4">
        <div className="flex items-end justify-between mb-12 border-b border-gray-200 pb-4">
          <div>
            <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
              Amazing glimpse
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              Past Events
            </h2>
          </div>
        </div>
        {past.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
            <CalendarDays size={48} className="mb-4" />
            <p className="font-medium">No past events recorded yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}

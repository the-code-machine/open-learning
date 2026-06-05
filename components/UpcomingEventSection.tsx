import Link from "next/link";
import { ArrowRight, Calendar, CalendarOff } from "lucide-react";
import { getEventsByStatus } from "@/lib/queries";
import { EventCard } from "@/components/ui/Cards";
/**
 * UpcomingEventsSection — landing-page slice that pulls upcoming + ongoing
 * events from the database. Empty state links to /events. We show up to
 * three of the soonest events to keep the section tight.
 */
export default async function UpcomingEventsSection() {
  const [upcoming, ongoing] = await Promise.all([
    getEventsByStatus("upcoming"),
    getEventsByStatus("ongoing"),
  ]);
  // ongoing first, then upcoming by date (queries already sort desc; resort asc here)
  const events = [
    ...ongoing,
    ...[...upcoming].sort((a, b) => a.date.localeCompare(b.date)),
  ].slice(0, 3);

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 border-b border-gray-200 pb-4">
          <div>
            <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
              Save the date
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Upcoming events
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Learning sessions, workshops, edit-a-thons, and community
              celebrations. All free, all open.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-green transition-colors whitespace-nowrap"
          >
            See all events <ArrowRight size={18} />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <CalendarOff size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">
              Nothing on the calendar right now.
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
              Want to host the next one? We provide brand guidance, event
              templates, and a reporting framework.
            </p>
            <Link
              href="mailto:wikiopenlearning@gmail.com?subject=Hosting%20a%20WOL%20event"
              className="inline-flex items-center gap-2 bg-brand-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-green transition-colors text-sm"
            >
              <Calendar size={16} /> Propose an event
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

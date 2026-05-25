import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Github,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CommunityHub() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-1 gap-16 items-start">
          {/* LEFT COLUMN: UPCOMING EVENTS */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Upcoming <span className="text-brand-red">Events</span>
              </h2>
              <Link
                href="/events"
                className="text-brand-blue font-semibold hover:underline text-sm"
              >
                View all events &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {/* Event Item 1 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-6 items-start group">
                {/* Date Badge */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-brand-blue/5 rounded-lg border border-brand-blue/20 group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                  <span className="text-sm font-bold text-brand-blue uppercase group-hover:text-white">
                    Oct
                  </span>
                  <span className="text-2xl font-bold text-gray-900 group-hover:text-white">
                    24
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                    Open Source 101: Getting Started
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={16} /> 10:00 AM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> Online (Zoom)
                    </span>
                  </div>
                </div>

                {/* Action Arrow (Visible on desktop) */}
                <div className="hidden sm:flex items-center justify-center h-full">
                  <ArrowRight className="text-gray-300 group-hover:text-brand-blue" />
                </div>
              </div>

              {/* Event Item 2 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-6 items-start group">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-brand-blue/5 rounded-lg border border-brand-blue/20 group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                  <span className="text-sm font-bold text-brand-blue uppercase group-hover:text-white">
                    Nov
                  </span>
                  <span className="text-2xl font-bold text-gray-900 group-hover:text-white">
                    02
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                    Wiki Hackathon: Education Tools
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={16} /> 09:00 AM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> City Library Hall
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center h-full">
                  <ArrowRight className="text-gray-300 group-hover:text-brand-blue" />
                </div>
              </div>

              {/* Event Item 3 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex gap-6 items-start group">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-brand-blue/5 rounded-lg border border-brand-blue/20 group-hover:bg-brand-blue group-hover:border-brand-blue transition-colors">
                  <span className="text-sm font-bold text-brand-blue uppercase group-hover:text-white">
                    Nov
                  </span>
                  <span className="text-2xl font-bold text-gray-900 group-hover:text-white">
                    15
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                    Community Meetup & Networking
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={16} /> 06:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={16} /> Tech Park, Wing B
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-center h-full">
                  <ArrowRight className="text-gray-300 group-hover:text-brand-blue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

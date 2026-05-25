"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import type { EventModel } from "@/lib/types";
import { ModeBadge, formatDate } from "./Badges";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function EventCalendar({ events }: { events: EventModel[] }) {
  // Map date -> event for quick lookup
  const eventsByDate = useMemo(() => {
    const m = new Map<string, EventModel>();
    events.forEach((e) => m.set(e.date, e));
    return m;
  }, [events]);

  // Start on the month of the soonest upcoming event, else the latest event.
  const initial = useMemo(() => {
    const upcoming = events
      .filter((e) => e.status !== "past")
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const anchor = upcoming ?? events[0];
    if (!anchor) return new Date();
    const [y, m] = anchor.date.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }, [events]);

  const [currentDate, setCurrentDate] = useState(initial);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => events[0]?.date ?? "",
  );

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${month}-${d}`;
  };

  const activeEvent = eventsByDate.get(selectedDate);

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* LEFT: selected event preview */}
      <div className="lg:col-span-7 bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden min-h-96 flex flex-col">
        {activeEvent ? (
          <div className="flex flex-col h-full">
            <div className="relative h-44 w-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white font-bold text-lg">
              {activeEvent.category}
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <CalendarIcon size={16} className="text-brand-red" />{" "}
                  {formatDate(activeEvent.date)}
                </span>
                {activeEvent.time && (
                  <span className="flex items-center gap-1">
                    <Clock size={16} className="text-brand-red" />{" "}
                    {activeEvent.time}
                  </span>
                )}
              </div>
              <div className="mb-3">
                <ModeBadge mode={activeEvent.mode} />
              </div>
              <h2 className="text-3xl font-bold text-brand-blue mb-4">
                {activeEvent.title}
              </h2>
              <p className="text-gray-600 mb-6 flex-1 line-clamp-4">
                {activeEvent.details}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                {activeEvent.location && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                    <MapPin size={18} className="text-brand-green" />
                    {activeEvent.location}
                  </div>
                )}
                <Link
                  href={`/events/${activeEvent.id}`}
                  className="ml-auto flex items-center gap-2 bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-red transition-colors"
                >
                  View Full Details <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              No event on this day
            </h3>
            <p className="text-gray-500">
              Pick a highlighted date to see what is happening.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: calendar */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl p-6 text-gray-900 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() - 1,
                  1,
                ),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="text-gray-600" />
          </button>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  1,
                ),
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-xs font-bold text-gray-400">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDateString(day);
            const hasEvent = eventsByDate.has(dateStr);
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={clsx(
                  "h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all relative",
                  isSelected
                    ? "bg-brand-blue text-white shadow-lg scale-110"
                    : "hover:bg-gray-100 text-gray-700",
                  !isSelected &&
                    hasEvent &&
                    "font-bold text-brand-blue bg-blue-50",
                )}
              >
                {day}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-red rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-blue rounded-full" /> Selected
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-red rounded-full" /> Event Day
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

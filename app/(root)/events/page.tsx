"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

// --- 1. MOCK DATA (Replace this with your API/Database later) ---
const EVENTS_DATA = [
  {
    id: 1,
    title: "Open Source 101 Bootcamp",
    date: "2025-10-24", // Format: YYYY-MM-DD
    time: "10:00 AM - 2:00 PM",
    location: "Online (Zoom)",
    category: "Workshop",
    image: "/images/event-workshop.jpg", // Make sure this exists or use a placeholder
    description:
      "A complete introduction to Git, GitHub, and how to make your first pull request. Perfect for beginners.",
  },
  {
    id: 2,
    title: "Wiki Hackathon: EdTech Tools",
    date: "2025-11-02",
    time: "09:00 AM - 6:00 PM",
    location: "City Library Hall, Bhopal",
    category: "Hackathon",
    image: "/images/event-hackathon.jpg",
    description:
      "Join us for a day of coding to build tools that help rural schools access education. Food and swag provided!",
  },
  {
    id: 3,
    title: "Community Meetup & Networking",
    date: "2025-11-15",
    time: "06:00 PM - 8:00 PM",
    location: "Tech Park, Wing B",
    category: "Meetup",
    image: "/images/event-meetup.jpg",
    description:
      "Connect with fellow developers, designers, and founders. Share your projects and find mentors.",
  },
];

export default function EventsPage() {
  // --- 2. STATE MANAGEMENT ---
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)); // Default to Oct 2025 for demo
  const [selectedDate, setSelectedDate] = useState<string>("2025-10-24"); // Default selected date

  // --- 3. CALENDAR LOGIC ---
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

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

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Generate formatting: YYYY-MM-DD
  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${month}-${d}`;
  };

  // Find event for the left side hero display
  const activeEvent = EVENTS_DATA.find((e) => e.date === selectedDate);

  return (
    <div className=" min-h-screen flex  justify-center items-center text-gray-600  text-center w-screen">
      <h1>Events Page Coming Soon!</h1>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     {/* --- HERO SECTION --- */}
  //     <section className="bg-brand-blue text-white pt-12 pb-24 relative overflow-hidden">
  //       {/* Background Patterns */}
  //       <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
  //         <div className="text-center mb-12">
  //           <h1 className="text-4xl font-bold mb-4">Community Calendar</h1>
  //           <p className="text-blue-100 max-w-2xl mx-auto">
  //             Discover upcoming workshops, hackathons, and meetups. Click on a
  //             date to see what's happening.
  //           </p>
  //         </div>

  //         <div className="grid lg:grid-cols-12 gap-8 items-start">
  //           {/* LEFT SIDE: SELECTED EVENT PREVIEW */}
  //           <div className="lg:col-span-7 bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
  //             {activeEvent ? (
  //               // IF EVENT EXISTS ON DATE
  //               <div className="flex flex-col h-full animate-fadeIn">
  //                 <div className="relative h-48 w-full bg-gray-200">
  //                   {/* Image Placeholder */}
  //                   <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
  //                     [Event Image: {activeEvent.title}]
  //                   </div>
  //                   {/* Use Next/Image if you have files:
  //                     <Image src={activeEvent.image} alt={activeEvent.title} fill className="object-cover" />
  //                    */}
  //                   <div className="absolute top-4 left-4 bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
  //                     {activeEvent.category}
  //                   </div>
  //                 </div>

  //                 <div className="p-8 flex-1 flex flex-col">
  //                   <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
  //                     <span className="flex items-center gap-1">
  //                       <CalendarIcon size={16} className="text-brand-red" />{" "}
  //                       {activeEvent.date}
  //                     </span>
  //                     <span className="flex items-center gap-1">
  //                       <Clock size={16} className="text-brand-red" />{" "}
  //                       {activeEvent.time}
  //                     </span>
  //                   </div>

  //                   <h2 className="text-3xl font-bold text-brand-blue mb-4">
  //                     {activeEvent.title}
  //                   </h2>
  //                   <p className="text-gray-600 mb-6 flex-1">
  //                     {activeEvent.description}
  //                   </p>

  //                   <div className="flex items-center justify-between border-t border-gray-100 pt-6">
  //                     <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
  //                       <MapPin size={18} className="text-brand-green" />
  //                       {activeEvent.location}
  //                     </div>
  //                     <Link
  //                       href={`/events/${activeEvent.id}`}
  //                       className="flex items-center gap-2 bg-brand-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-red transition-colors"
  //                     >
  //                       View Full Details <ArrowRight size={18} />
  //                     </Link>
  //                   </div>
  //                 </div>
  //               </div>
  //             ) : (
  //               // IF NO EVENT ON DATE
  //               <div className="flex flex-col items-center justify-center h-full p-12 text-center">
  //                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
  //                   <CalendarIcon size={40} />
  //                 </div>
  //                 <h3 className="text-2xl font-bold text-gray-400 mb-2">
  //                   No events on this day
  //                 </h3>
  //                 <p className="text-gray-500">
  //                   Select a highlighted date on the calendar to see details.
  //                 </p>
  //               </div>
  //             )}
  //           </div>

  //           {/* RIGHT SIDE: CUSTOM CALENDAR */}
  //           <div className="lg:col-span-5 bg-white rounded-2xl shadow-xl p-6 text-gray-900 border border-gray-100">
  //             {/* Calendar Header */}
  //             <div className="flex items-center justify-between mb-6">
  //               <button
  //                 onClick={handlePrevMonth}
  //                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
  //               >
  //                 <ChevronLeft className="text-gray-600" />
  //               </button>
  //               <h3 className="text-xl font-bold text-gray-900">
  //                 {monthNames[currentDate.getMonth()]}{" "}
  //                 {currentDate.getFullYear()}
  //               </h3>
  //               <button
  //                 onClick={handleNextMonth}
  //                 className="p-2 hover:bg-gray-100 rounded-full transition-colors"
  //               >
  //                 <ChevronRight className="text-gray-600" />
  //               </button>
  //             </div>

  //             {/* Days Header */}
  //             <div className="grid grid-cols-7 text-center mb-4">
  //               {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
  //                 <span key={d} className="text-xs font-bold text-gray-400">
  //                   {d}
  //                 </span>
  //               ))}
  //             </div>

  //             {/* Calendar Grid */}
  //             <div className="grid grid-cols-7 gap-2">
  //               {/* Empty slots for days before start of month */}
  //               {Array.from({ length: firstDayOfMonth }).map((_, i) => (
  //                 <div key={`empty-${i}`} />
  //               ))}

  //               {/* Actual Days */}
  //               {Array.from({ length: daysInMonth }).map((_, i) => {
  //                 const day = i + 1;
  //                 const dateStr = formatDateString(day);
  //                 const hasEvent = EVENTS_DATA.some((e) => e.date === dateStr);
  //                 const isSelected = selectedDate === dateStr;

  //                 return (
  //                   <button
  //                     key={day}
  //                     onClick={() => setSelectedDate(dateStr)}
  //                     className={clsx(
  //                       "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative",
  //                       isSelected
  //                         ? "bg-brand-blue text-white shadow-lg scale-110"
  //                         : "hover:bg-gray-100 text-gray-700",
  //                       !isSelected &&
  //                         hasEvent &&
  //                         "font-bold text-brand-blue bg-blue-50"
  //                     )}
  //                   >
  //                     {day}
  //                     {/* Red Dot indicator for events */}
  //                     {hasEvent && !isSelected && (
  //                       <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-red rounded-full"></span>
  //                     )}
  //                   </button>
  //                 );
  //               })}
  //             </div>

  //             <div className="mt-6 pt-6 border-t border-gray-100">
  //               <div className="flex items-center gap-4 text-xs text-gray-500 justify-center">
  //                 <div className="flex items-center gap-2">
  //                   <span className="w-2 h-2 bg-brand-blue rounded-full"></span>{" "}
  //                   Selected
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <span className="w-2 h-2 bg-brand-red rounded-full"></span>{" "}
  //                   Event Day
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* --- ALL EVENTS LIST SECTION --- */}
  //     <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
  //       <div className="flex items-end justify-between mb-12 border-b border-gray-200 pb-4">
  //         <div>
  //           <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
  //             Amazing Glimpse
  //           </span>
  //           <h2 className="text-3xl font-bold text-gray-900 mt-2">
  //             Our Past Events
  //           </h2>
  //         </div>
  //       </div>

  //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  //         {EVENTS_DATA.map((event) => (
  //           <div
  //             key={event.id}
  //             className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
  //           >
  //             {/* Card Image */}
  //             <div className="relative h-48 bg-gray-200 overflow-hidden">
  //               {/* Placeholder - replace with <Image> */}
  //               <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/80 to-brand-green/80 flex items-center justify-center text-white font-bold opacity-90 group-hover:scale-105 transition-transform duration-500">
  //                 {event.category}
  //               </div>

  //               {/* Date Badge Overlay */}
  //               <div className="absolute top-4 right-4 bg-white rounded-lg p-2 text-center shadow-md">
  //                 <span className="block text-xs font-bold text-gray-500 uppercase">
  //                   {new Date(event.date).toLocaleString("default", {
  //                     month: "short",
  //                   })}
  //                 </span>
  //                 <span className="block text-xl font-bold text-brand-red">
  //                   {new Date(event.date).getDate()}
  //                 </span>
  //               </div>
  //             </div>

  //             <div className="p-6">
  //               <div className="flex items-center gap-2 text-xs font-bold text-brand-blue mb-3">
  //                 <span className="bg-blue-50 px-2 py-1 rounded">
  //                   {event.category}
  //                 </span>
  //               </div>

  //               <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
  //                 {event.title}
  //               </h3>

  //               <div className="space-y-2 text-sm text-gray-500 mb-6">
  //                 <div className="flex items-center gap-2">
  //                   <CalendarIcon size={16} /> {event.date}
  //                 </div>
  //                 <div className="flex items-center gap-2">
  //                   <MapPin size={16} /> {event.location}
  //                 </div>
  //               </div>

  //               <Link
  //                 href={`/events/${event.id}`}
  //                 className="block w-full text-center py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:border-brand-blue hover:text-brand-blue transition-colors"
  //               >
  //                 View Details
  //               </Link>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </section>
  //   </div>
  // );
}

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Share2,
  User,
  CheckCircle2,
  Map,
} from "lucide-react";

// --- 1. MOCK DATA FETCHING (Simulating a Database Call) ---
// In a real app, you would fetch this from your API or DB using the ID.

const getEventData = async (id: string) => {
  // Simulating network delay
  // await new Promise(resolve => setTimeout(resolve, 500));

  const allEvents = [
    {
      id: "1",
      title: "Open Source 101 Bootcamp",
      category: "Workshop",
      date: "October 24, 2025",
      time: "10:00 AM - 2:00 PM",
      location: "Online (Zoom)",
      price: "Free",
      description:
        "A complete introduction to Git, GitHub, and how to make your first pull request. This workshop is designed for absolute beginners who want to start their journey in open source contribution.",
      agenda: [
        { time: "10:00 AM", title: "Introduction to Version Control" },
        { time: "11:00 AM", title: "Git Basics (Clone, Branch, Commit)" },
        { time: "12:30 PM", title: "Making your first Pull Request" },
        { time: "01:30 PM", title: "Q&A and Code Review" },
      ],
      speakers: [
        { name: "Dev Jadiya", role: "Tech Lead", company: "Wiki Open" },
        { name: "Sarah Smith", role: "Senior Dev", company: "Google" },
      ],
      learningPoints: [
        "Understanding Git flow and commands",
        "How to fork a repository and sync changes",
        "Best practices for commit messages",
        "Navigating merge conflicts",
      ],
    },
    {
      id: "2",
      title: "Wiki Hackathon: EdTech Tools",
      category: "Hackathon",
      date: "November 02, 2025",
      time: "09:00 AM - 6:00 PM",
      location: "City Library Hall, Bhopal",
      price: "Free",
      description:
        "Join us for a day of coding to build tools that help rural schools access education. We will be building lightweight LMS systems and offline-first learning apps.",
      agenda: [
        { time: "09:00 AM", title: "Check-in & Team Formation" },
        { time: "10:00 AM", title: "Coding Begins" },
        { time: "01:00 PM", title: "Lunch Break" },
        { time: "05:00 PM", title: "Demos & Judging" },
      ],
      speakers: [
        { name: "Sarthak Khare", role: "Operations", company: "Wiki Open" },
      ],
      learningPoints: [
        "Building offline-first applications",
        "Team collaboration under pressure",
        "Pitching your product",
        "React & Node.js Implementation",
      ],
    },
    {
      id: "3",
      title: "Community Meetup & Networking",
      category: "Meetup",
      date: "November 15, 2025",
      time: "06:00 PM - 8:00 PM",
      location: "Tech Park, Wing B",
      price: "Free",
      description:
        "Connect with fellow developers, designers, and founders. Share your projects, find mentors, and enjoy some pizza on the house.",
      agenda: [],
      speakers: [],
      learningPoints: [],
    },
  ];

  return allEvents.find((e) => e.id === id);
};

// --- 2. SERVER COMPONENT ---
// In Next.js App Router, params are passed as props to the page
interface PageProps {
  params: {
    id: string;
  };
}

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventData(id);

  if (!event) {
    notFound(); // Returns the 404 page
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* --- HERO HEADER --- */}
      <section className="relative bg-brand-blue text-white py-20 overflow-hidden">
        {/* Abstract BG */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/events"
            className="inline-flex items-center text-blue-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Calendar
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="inline-block py-1 px-3 rounded bg-brand-green/20 border border-brand-green text-brand-green font-bold text-xs uppercase tracking-wide mb-4 backdrop-blur-sm">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm md:text-base text-blue-100">
                <span className="flex items-center gap-2">
                  <Calendar size={18} /> {event.date}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={18} /> {event.time}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={18} /> {event.location}
                </span>
              </div>
            </div>

            {/* Share Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium backdrop-blur-md">
              <Share2 size={18} /> Share Event
            </button>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (2/3) - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. About Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About the Event
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {event.description}
              </p>

              {/* Learning Points */}
              {event.learningPoints.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4">
                    What you will learn
                  </h3>
                  <ul className="space-y-3">
                    {event.learningPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <CheckCircle2 className="text-brand-green w-5 h-5 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. Agenda Section */}
            {event.agenda.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Schedule
                </h2>
                <div className="space-y-6">
                  {event.agenda.map((item, index) => (
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

            {/* 3. Speakers Section */}
            {event.speakers.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Speakers & Mentors
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center text-brand-blue">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {speaker.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {speaker.role} @ {speaker.company}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (1/3) - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Registration Card */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-t-4 border-brand-green">
                <div className="mb-6">
                  <span className="text-gray-500 text-sm font-medium">
                    Registration Fee
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {event.price}
                    </span>
                    {event.price === "Free" && (
                      <span className="text-brand-green text-sm font-bold mb-1">
                        Open for all
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full bg-brand-green text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20 mb-4">
                  Register Now
                </button>

                <p className="text-xs text-center text-gray-400">
                  Limited seats available. Registration closes 24h before event.
                </p>
              </div>

              {/* Location Map Placeholder */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Map size={18} /> Location
                </h3>
                <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
                  Map View
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{event.location}</strong>
                  <br />
                  View on Google Maps
                </p>
              </div>

              {/* Organizer Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  W
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Organized by
                  </p>
                  <p className="font-bold text-gray-900">Wiki Open Learning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

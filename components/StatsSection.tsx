import { Users, Globe2, Layers, Calendar } from "lucide-react";

/**
 * StatsSection — a quick by-the-numbers strip. Numbers come from the Meta
 * page where verifiable (8 buckets, 5 event formats) and from project memory
 * for the rest. Conservative figures only; nothing fabricated.
 */
const STATS = [
  {
    Icon: Layers,
    value: "8",
    label: "Learning buckets",
    sub: "From onboarding to funding",
  },
  {
    Icon: Calendar,
    value: "5",
    label: "Event formats",
    sub: "Sessions to hackathons",
  },
  {
    Icon: Globe2,
    value: "Any",
    label: "Language welcome",
    sub: "Online & offline",
  },
  {
    Icon: Users,
    value: "Free",
    label: "Membership",
    sub: "No fees, no forms",
  },
];

export default function StatsSection() {
  return (
    <section className="w-full bg-brand-blue py-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-green/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ Icon, value, label, sub }) => (
            <div
              key={label}
              className="text-center text-white border-l-2 border-white/20 pl-5 first:border-l-0 first:pl-0 lg:border-l-2 lg:pl-5"
            >
              <Icon size={22} className="mx-auto mb-3 text-brand-green" />
              <div className="text-4xl md:text-5xl font-extrabold leading-none">
                {value}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider font-bold text-white">
                {label}
              </div>
              <div className="mt-1 text-xs text-blue-100">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight, MousePointer2, PlayCircle, Upload } from "lucide-react";

/**
 * HowItWorks — the contribution loop, taken straight from the Meta page's
 * "Contribute a learning" three-step section: pick a topic, record, upload to
 * Commons. Reframed for landing visitors who are either learners or
 * potential contributors.
 */
const STEPS = [
  {
    n: "01",
    Icon: MousePointer2,
    title: "Pick what you need",
    desc: "Browse the Learnings library on Meta or join a live workshop. Topics range from your first edit to deploying a Toolforge tool.",
    color: "bg-brand-blue text-white",
  },
  {
    n: "02",
    Icon: PlayCircle,
    title: "Learn at your pace",
    desc: "Watch the video tutorial, follow along in your sandbox, or come to a scheduled session. Every resource is free and on Commons under a free licence.",
    color: "bg-brand-green text-white",
  },
  {
    n: "03",
    Icon: Upload,
    title: "Give back",
    desc: "Record your own tutorial, host a session in your city, or propose a campaign. We pair new contributors with members to help you ship.",
    color: "bg-brand-red text-white",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Three steps. No application required.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
          {/* connecting line behind cards (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-brand-blue via-brand-green to-brand-red -z-0" />

          {STEPS.map(({ n, Icon, title, desc, color }) => (
            <div
              key={n}
              className="relative bg-white rounded-2xl p-7 border border-gray-100 hover:shadow-lg transition-shadow z-10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-md`}
                >
                  <Icon size={26} />
                </div>
                <span className="text-4xl font-extrabold text-gray-100 tracking-tighter">
                  {n}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="https://meta.wikimedia.org/wiki/Talk:Wiki_Open_Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-green transition-colors"
          >
            Have a topic to contribute? Reach the team on Meta-Wiki{" "}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

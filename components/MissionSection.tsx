import Link from "next/link";
import {
  UserPlus,
  Pencil,
  Wrench,
  ShieldCheck,
  Server,
  Users,
  Megaphone,
  Coins,
  ArrowRight,
} from "lucide-react";

/**
 * MissionSection — what WOL does, expressed as the eight thematic buckets
 * from the Meta page (Onboarding, Editing, Tools, Rights, Infrastructure,
 * Community, Campaigns, Funding). Uses the site brand palette; bucket
 * accents are kept subtle so it stays on theme.
 */

const BUCKETS = [
  {
    Icon: UserPlus,
    title: "Onboarding",
    desc: "First steps for new contributors — accounts, user pages, talk pages, and that first edit.",
    accent: "from-brand-blue/15 to-brand-blue/5 text-brand-blue",
  },
  {
    Icon: Pencil,
    title: "Editing",
    desc: "Project-specific editing skills across Wikipedia, Commons, Wikidata, Wikivoyage, and more.",
    accent: "from-brand-blue/15 to-brand-blue/5 text-brand-blue",
  },
  {
    Icon: Wrench,
    title: "Tools",
    desc: "Community tools, scripts, and gadgets that make editing faster and more powerful.",
    accent: "from-amber-100 to-amber-50 text-amber-700",
  },
  {
    Icon: ShieldCheck,
    title: "Rights",
    desc: "User rights and permissions — event organiser, autopatrolled, rollback, and more.",
    accent: "from-pink-100 to-pink-50 text-pink-700",
  },
  {
    Icon: Server,
    title: "Infrastructure",
    desc: "Toolforge, MediaWiki, OAuth, Git, Phabricator, Gerrit — the technical stack of the movement.",
    accent: "from-amber-100 to-amber-50 text-amber-700",
  },
  {
    Icon: Users,
    title: "Community",
    desc: "Communication, governance, conduct — how to navigate the social side of Wikimedia.",
    accent: "from-brand-green/15 to-brand-green/5 text-brand-green",
  },
  {
    Icon: Megaphone,
    title: "Campaigns",
    desc: "Wiki Loves, edit-a-thons, and inclusive content campaigns run by community members.",
    accent: "from-purple-100 to-purple-50 text-purple-700",
  },
  {
    Icon: Coins,
    title: "Funding",
    desc: "Grants, scholarships, and sponsorships — Rapid Grants, Project Grants, conference funding.",
    accent: "from-gray-200 to-gray-50 text-gray-700",
  },
];

export default function MissionSection() {
  return (
    <section className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
            What we do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 max-w-3xl mx-auto">
            Eight buckets of operational knowledge.
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed">
            From your first edit to running a grant-funded campaign, our
            tutorials and events cover the full operational lifecycle of being a
            Wikimedia contributor.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BUCKETS.map(({ Icon, title, desc, accent }) => (
            <div
              key={title}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${accent}`}
              >
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning/Learnings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-green transition-colors"
          >
            Browse the full Learnings library on Meta-Wiki{" "}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

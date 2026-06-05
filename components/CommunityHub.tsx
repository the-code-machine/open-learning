import Link from "next/link";
import { Send, MessageCircle, Youtube, Mail } from "lucide-react";

/**
 * CommunitySection — the four channels from the Meta page's "Want to be
 * notified" call-out: Telegram, WhatsApp, YouTube, email. All real links
 * sourced from the page text.
 */
const CHANNELS = [
  {
    Icon: Send,
    name: "Telegram",
    desc: "Daily community chat, event notifications, quick help.",
    href: "https://t.me/wikiopenlearning",
    cta: "Open chat",
    tone: "bg-brand-blue text-white hover:bg-brand-green",
    card: "border-brand-blue/30",
  },
  // {
  //   Icon: MessageCircle,
  //   name: "WhatsApp",
  //   desc: "Group for India-focused conversations and event reminders.",
  //   href: "https://chat.whatsapp.com/Hxhm0QTW5EHFpKm4sLOv3h",
  //   cta: "Join group",
  //   tone: "bg-brand-green text-white hover:bg-brand-blue",
  //   card: "border-brand-green/30",
  // },
  {
    Icon: Youtube,
    name: "YouTube",
    desc: "Live-streamed sessions and the full video tutorial library.",
    href: "https://www.youtube.com/@WikiOpenlearning",
    cta: "Watch sessions",
    tone: "bg-brand-red text-white hover:bg-red-800",
    card: "border-brand-red/30",
  },
  {
    Icon: Mail,
    name: "Email",
    desc: "Propose an event, suggest a tutorial, or just say hello.",
    href: "mailto:wikiopenlearning@gmail.com",
    cta: "Email us",
    tone: "bg-gray-900 text-white hover:bg-gray-700",
    card: "border-gray-200",
  },
];

export default function CommunitySection() {
  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-brand-green font-bold tracking-wide uppercase text-sm">
            Community
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Find us wherever you already are.
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mt-4">
            Four channels, one community. Pick whichever you like — the same
            people are on the other end.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHANNELS.map(({ Icon, name, desc, href, cta, tone, card }) => (
            <div
              key={name}
              className={`bg-white rounded-2xl p-6 border-2 ${card} flex flex-col`}
            >
              <Icon size={28} className="text-gray-700 mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5 flex-1">
                {desc}
              </p>
              <Link
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  href.startsWith("mailto:") ? undefined : "noopener noreferrer"
                }
                className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${tone}`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

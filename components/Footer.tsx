import Link from "next/link";
import Image from "next/image";
import {
  Send,
  MessageCircle,
  Youtube,
  Mail,
  Heart,
  ExternalLink,
  BookOpen,
} from "lucide-react";

/**
 * Footer — full, multi-column footer with real WOL channels (Telegram,
 * WhatsApp, YouTube, email from the Meta page), navigation, Meta-Wiki links,
 * and CC BY-SA 4.0 attribution. The licence matches Wikimedia Commons, where
 * WOL's tutorials are hosted, and is the standard for Wikimedia-aligned
 * community work.
 */
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-12 gap-10">
          {/* brand col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1.5">
                <Image
                  width={36}
                  height={36}
                  src="/logo.svg"
                  alt="Wiki Open Learning"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white leading-none">
                  WIKI OPEN
                </h3>
                <p className="text-xs font-semibold text-brand-green tracking-widest mt-1">
                  LEARNING
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              An open Wikimedia initiative focused on learning, participation,
              and capacity building across Wikimedia projects.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://t.me/wikiopenlearning"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-blue flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </a>

              <a
                href="https://www.youtube.com/@WikiOpenlearning"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand-red flex items-center justify-center transition-colors"
              >
                <Youtube size={16} />
              </a>
              <a
                href="mailto:wikiopenlearning@gmail.com"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-gray-600 flex items-center justify-center transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* explore */}
          <div className="md:col-span-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/mission"
                  className="hover:text-white transition-colors"
                >
                  Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-white transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/games"
                  className="hover:text-white transition-colors"
                >
                  Games
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-white transition-colors"
                >
                  Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* on Meta */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              On Meta-Wiki
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Initiative page <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning/Learnings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Learnings library <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning/Members"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Members <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning/Working_Groups"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Working Groups <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://meta.wikimedia.org/wiki/Talk:Wiki_Open_Learning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Talk page <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* get involved */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Get involved
            </h4>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Host an event, record a tutorial, or just come to a session.
              Membership is free — no application, no fees.
            </p>
            <Link
              href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning/Members"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-blue transition-colors"
            >
              <BookOpen size={14} /> Become a member
            </Link>
          </div>
        </div>
      </div>

      {/* legal / licence strip */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-gray-500">
            <p className="flex items-center gap-1.5">
              Made with{" "}
              <Heart
                size={12}
                className="text-brand-red fill-current"
                aria-label="love"
              />{" "}
              by the Wiki Open Learning community.
            </p>

            <p className="text-center md:text-left">
              Content on this site is released under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white underline underline-offset-2"
              >
                CC BY-SA 4.0
              </a>
              , the same licence as Wikimedia Commons. Reuse freely with
              attribution and share-alike.
            </p>

            <p className="text-right">
              © {new Date().getFullYear()} Wiki Open Learning
            </p>
          </div>
          <p className="text-[10px] text-gray-600 mt-3 text-center md:text-left">
            Wiki Open Learning is a community initiative aligned with Wikimedia
            projects. Not officially endorsed by the Wikimedia Foundation.
            Wikipedia, Wikimedia, and related marks are trademarks of the
            Wikimedia Foundation.
          </p>
        </div>
      </div>
    </footer>
  );
}

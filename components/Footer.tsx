import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  SendIcon,
} from "lucide-react";
import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center space-y-6">
        {/* 1. Logo / Brand Name */}
        <Image width={80} height={32} src="/logo.svg" alt="" className="" />
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-brand-blue">
            WIKI OPEN
          </h3>
          <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">
            Learning Together, Growing Together
          </p>
        </div>

        {/* 2. Simple Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-600">
          <Link
            href="/about"
            className="hover:text-brand-red transition-colors"
          >
            About
          </Link>
          <Link
            href="/mission"
            className="hover:text-brand-red transition-colors"
          >
            Mission
          </Link>
          <Link
            href="/events"
            className="hover:text-brand-red transition-colors"
          >
            Events
          </Link>
          <Link
            href="/projects"
            className="hover:text-brand-red transition-colors"
          >
            Projects
          </Link>
          {/* <Link
            href="/contact"
            className="hover:text-brand-red transition-colors"
          >
            Contact
          </Link> */}
        </nav>

        {/* 3. Social Icons (Soft & Round) */}
        <div className="flex gap-4">
          <a
            href="https://t.me/wikiopenlearning"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300"
            aria-label="Twitter"
          >
            <SendIcon size={18} />
          </a>
          {/* <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a> */}
          {/* <a
            href="#"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a> */}
        </div>

        {/* 4. Copyright & Sweet Note */}
        <div className="pt-6 border-t border-gray-100 w-full max-w-xs mx-auto">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            Made with{" "}
            <Heart size={12} className="text-brand-red fill-current" /> for the
            community.
          </p>
          <p className="text-xs text-gray-300 mt-2">
            © {new Date().getFullYear()} Wiki Open Learning
          </p>
        </div>
      </div>
    </footer>
  );
}

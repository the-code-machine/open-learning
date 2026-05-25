import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export default function JoinCTA() {
  return (
    <section className="relative w-full py-20 bg-brand-blue overflow-hidden">
      {/* Decorative Arch (Subtle Background) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border-[40px] border-white/5 rounded-full -mt-96 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] border-[30px] border-white/5 rounded-full -mt-80 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Ready to Start Your{" "}
          <span className="text-brand-green">Open Learning</span> Journey?
        </h2>

        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Whether you want to contribute to a project, learn a new skill, or
          mentor others, there is a place for you here. Membership is free and
          open to everyone.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary Action: Join (Uses Brand Green for "Go") */}
          <Link
            href="https://t.me/wikiopenlearning"
            className="w-full sm:w-auto px-8 py-4 bg-brand-green hover:bg-green-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            Become a Member <ArrowRight size={20} />
          </Link>

          {/* Secondary Action: Contact (Uses Transparent/White) */}
          {/* <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={20} /> Contact Us
          </Link> */}
        </div>

        {/* <p className="mt-8 text-sm text-blue-200">
          Already a member?{" "}
          <Link
            href="/login"
            className="text-white underline hover:text-brand-green"
          >
            Log in here
          </Link>
        </p> */}
      </div>
    </section>
  );
}

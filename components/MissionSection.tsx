import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MissionSection() {
  return (
    <section className="w-full bg-white">
      {/* 1. STATS STRIP */}
      <div className="bg-brand-blue py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-x divide-blue-400/30">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white">50+</span>
              <span className="text-blue-100 text-sm mt-1 uppercase tracking-wider">
                Members
              </span>
            </div>

            {/* <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white">50+</span>
              <span className="text-blue-100 text-sm mt-1 uppercase tracking-wider">
                Open Projects
              </span>
            </div> */}

            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white">3</span>
              <span className="text-blue-100 text-sm mt-1 uppercase tracking-wider">
                Workshops
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-4xl font-bold text-white">100%</span>
              <span className="text-blue-100 text-sm mt-1 uppercase tracking-wider">
                Free Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MISSION / PILLARS SECTION */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Empowering the{" "}
              <span className="text-brand-red">Open Learning</span> Movement
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              We believe knowledge should be free and accessible. Our Intiative
              brings learners, builders, and curious mind to build something for
              open knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Projects */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl">
                <Image
                  src="/projects.png" // Make sure this image exists in public folder
                  alt="Collaborative Projects"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Collaborative Projects
              </h3>
              <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                Join real-world open source projects. Gain experience by
                contributing to software, research, and community initiatives.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center text-brand-blue font-semibold hover:text-brand-red transition-colors mt-auto"
              >
                Find a Project <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Events */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl">
                <Image
                  src="/workshop.png" // You need to add this image
                  alt="Live Workshops"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Workshops and events
              </h3>
              <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                Attend webinars and local meetups. Learn from industry experts
                and peer mentors in real-time sessions.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center text-brand-red font-semibold hover:text-brand-blue transition-colors mt-auto"
              >
                See Calendar <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: Community (About) */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl">
                <Image
                  src="/community.png"
                  alt="Community Network"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community Network
              </h3>
              <p className="text-gray-600 mb-6 line-clamp-3 flex-1">
                Connect with like-minded learners. Our network supports your
                growth through peer reviews and mentorship.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-brand-green font-semibold hover:text-brand-blue transition-colors mt-auto"
              >
                Meet the Team <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

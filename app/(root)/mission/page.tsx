import { image } from "framer-motion/client";
import { Target, Globe, Heart, Shield, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function MissionPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue via-brand-red to-brand-green"></div>

        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Our Mission is to <br />
            <span className="text-brand-blue">Democratize</span> Knowledge.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            We are building a world where quality education is not a privilege,
            but a fundamental right accessible to anyone with an internet
            connection.
          </p>
        </div>
      </section>

      {/* 2. THE THREE PILLARS (Brand Colors) */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1: Access (Blue) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-brand-blue hover:shadow-lg transition-shadow">
              <div className="w-20 h-20  relative overflow-hidden flex items-center justify-center mb-4">
                <Image
                  src={"/earth.png"}
                  alt="universal access"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Universal Access
              </h3>
              <p className="text-gray-600">
                Removing financial and geographical barriers. All our resources,
                roadmaps, and tools are free and open-source forever.
              </p>
            </div>

            {/* Pillar 2: Community (Red) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-brand-red hover:shadow-lg transition-shadow">
              <div className="w-20 h-20  relative overflow-hidden flex items-center justify-center mb-4">
                <Image
                  src={"/group.png"}
                  alt="universal access"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community Driven
              </h3>
              <p className="text-gray-600">
                We believe in the power of "We". Our curriculum is built by the
                community, for the community, ensuring it stays relevant.
              </p>
            </div>

            {/* Pillar 3: Growth (Green) */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-brand-green hover:shadow-lg transition-shadow">
              <div className="w-20 h-20  relative overflow-hidden flex items-center justify-center mb-4">
                <Image
                  src={"/practical.png"}
                  alt="universal access"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Practical Growth
              </h3>
              <p className="text-gray-600">
                Moving beyond theory. We focus on project-based learning that
                helps members build portfolios and land real jobs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES GRID */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            {/* Left: Heading */}
            <div className="md:w-1/3">
              <span className="text-brand-green font-bold tracking-wider uppercase text-sm">
                Our Values
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-6">
                What We Stand For
              </h2>
              <p className="text-gray-600 mb-8">
                These principles guide every decision we make, from the code we
                write to the events we organize.
              </p>
              <Link
                href="/join"
                className="text-brand-blue font-semibold hover:underline"
              >
                Join our community &rarr;
              </Link>
            </div>

            {/* Right: Grid */}
            <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <BookOpen size={20} className="text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Open Source First</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    We default to open. If we build it, we share the code.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Users size={20} className="text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Inclusivity</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    We foster a safe space for beginners and experts alike.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Shield size={20} className="text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Transparency</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    We are open about our finances, decisions, and roadmap.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Target size={20} className="text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Impact Focused</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    We measure success by the skills our members gain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// <section className="py-20 bg-brand-blue text-white">
//   <div className="max-w-4xl mx-auto px-4 text-center">
//     <h2 className="text-3xl font-bold mb-12">Our Goals for 2025</h2>

//     <div className="space-y-8 text-left">
//       {/* Goal 1 */}
//       <div className="flex gap-6 items-center bg-white/10 p-6 rounded-xl border border-white/20">
//         <span className="text-4xl font-bold text-brand-green opacity-80">
//           01
//         </span>
//         <div>
//           <h3 className="text-xl font-bold">
//             Launch the Wiki Learning Portal
//           </h3>
//           <p className="text-blue-100 text-sm">
//             A centralized platform for roadmaps and tutorials.
//           </p>
//         </div>
//       </div>

//       {/* Goal 2 */}
//       <div className="flex gap-6 items-center bg-white/10 p-6 rounded-xl border border-white/20">
//         <span className="text-4xl font-bold text-brand-red opacity-80">
//           02
//         </span>
//         <div>
//           <h3 className="text-xl font-bold">Educate 10,000 Students</h3>
//           <p className="text-blue-100 text-sm">
//             Through free workshops, hackathons, and mentorship programs.
//           </p>
//         </div>
//       </div>

//       {/* Goal 3 */}
//       <div className="flex gap-6 items-center bg-white/10 p-6 rounded-xl border border-white/20">
//         <span className="text-4xl font-bold text-white opacity-80">
//           03
//         </span>
//         <div>
//           <h3 className="text-xl font-bold">
//             Partner with 50+ Open Source Orgs
//           </h3>
//           <p className="text-blue-100 text-sm">
//             Connecting our students directly with real-world projects.
//           </p>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

import Image from "next/image";
import Link from "next/link";
import { Linkedin, Github, Globe, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO / INTRO SECTION */}
      <section className="relative py-20 bg-gray-50 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -ml-16 -mb-16"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold tracking-wide uppercase mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Building the Future of <br />
            <span className="text-brand-red">Open Education</span>
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Wiki Open Learning was born from a simple idea:{" "}
            <strong>
              Knowledge should be free, accessible, and community-driven.
            </strong>{" "}
            We are building a platform where developers, students, and creators
            can collaborate on open-source projects without barriers.
          </p>
        </div>
      </section>

      {/* 2. FOUNDERS SECTION */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Meet the Founders
            </h2>
            <p className="mt-4 text-gray-500">
              The minds behind the initiative.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* FOUNDER 1: DEV JADIYA */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-brand-blue transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-blue rounded-t-2xl"></div>

              <div className="flex flex-col items-center text-center">
                {/* Photo Placeholder */}
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-brand-blue/10 rounded-full animate-pulse"></div>
                  <Image
                    src="https://media.licdn.com/dms/image/v2/D4D03AQFNwaghZ9Tejw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1728457620725?e=1767225600&v=beta&t=UjXSE0jUwfFocbwjPszMBTPAeuJi3IKoOweDM4J9ocY" // Put Dev's photo here
                    alt="Dev Jadiya"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">Dev Jadiya</h3>
                <span className="text-brand-blue font-semibold text-sm mb-4">
                  Co-Founder & Tech Lead
                </span>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Dev is the technical architect behind Wiki Open Learning. With
                  a deep passion for open-source software, he leads the
                  engineering efforts to ensure our platform is robust,
                  scalable, and accessible to everyone.
                </p>

                {/* Social Links */}
                <div className="flex gap-4">
                  <Link
                    href="https://www.linkedin.com/in/devjadiya"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-brand-blue hover:text-white transition-colors text-gray-600"
                  >
                    <Linkedin size={20} />
                  </Link>
                  <Link
                    href="https://github.com/devjadiya"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-900 hover:text-white transition-colors text-gray-600"
                  >
                    <Github size={20} />
                  </Link>
                  <Link
                    href="https://meta.wikimedia.org/wiki/User:Dev_Jadiya"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-brand-green hover:text-white transition-colors text-gray-600"
                  >
                    <Globe size={20} />
                  </Link>
                </div>
              </div>
            </div>

            {/* FOUNDER 2: SARTHAK KHARE */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:border-brand-red transition-all duration-300 hover:-translate-y-2">
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-red rounded-t-2xl"></div>

              <div className="flex flex-col items-center text-center">
                {/* Photo Placeholder */}
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-brand-red/10 rounded-full animate-pulse"></div>
                  <Image
                    src="https://media.licdn.com/dms/image/v2/D4D03AQFUHnGdTJC5hw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1716127531824?e=1767225600&v=beta&t=aULf0K35xgq--DP6OQxsDP7tNr6q_kkKeQTq_DTszJc" // Put Sarthak's photo here
                    alt="Sarthak Khare"
                    fill
                    className="rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Sarthak Khare
                </h3>
                <span className="text-brand-red font-semibold text-sm mb-4">
                  Co-Founder & Operations Lead
                </span>

                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Sarthak drives the community vision and strategic
                  partnerships. He focuses on bridging the gap between learners
                  and resources, ensuring that the Wiki Open Learning mission
                  reaches students across the globe.
                </p>

                {/* Social Links */}
                <div className="flex gap-4">
                  <Link
                    href="https://www.linkedin.com/in/sarthak-khare-898084253"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-brand-blue hover:text-white transition-colors text-gray-600"
                  >
                    <Linkedin size={20} />
                  </Link>
                  <Link
                    href="https://github.com/the-code-machine"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-900 hover:text-white transition-colors text-gray-600"
                  >
                    <Github size={20} />
                  </Link>
                  <Link
                    href="https://meta.wikimedia.org/wiki/User:Sarthak_Khare_1305"
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-brand-green hover:text-white transition-colors text-gray-600"
                  >
                    <Globe size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INITIATIVE DETAILS */}
      <section className="bg-white pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-3xl p-8 md:p-16 overflow-hidden relative">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-green/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Why We Started This?
                </h3>
                <div className="space-y-4 text-gray-400">
                  <p>
                    We realized that while information is everywhere,{" "}
                    <strong>structured learning paths and mentorship</strong>{" "}
                    are often locked behind paywalls.
                  </p>
                  <p>
                    This initiative aims to create a centralized hub where
                    anyone can contribute to educational roadmaps, host free
                    workshops, and showcase their projects to potential
                    employers.
                  </p>
                </div>
                <div className="mt-8">
                  <Link
                    href="/join"
                    className="inline-flex items-center text-brand-green font-bold hover:text-white transition-colors"
                  >
                    Join the Movement <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Stats / Visual */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold">
                        Open Collaboration
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Every project and roadmap is open-source. Fork it,
                        improve it, share it.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold">Skill Building</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Real-world experience through community hackathons and
                        live coding sessions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

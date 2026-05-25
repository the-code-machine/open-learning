"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Github,
  ExternalLink,
  Star,
  GitFork,
  Code2,
  Layers,
  Cpu,
} from "lucide-react";
import clsx from "clsx";

// --- 1. MOCK DATA ---
const PROJECTS_DATA = [
  {
    id: 1,
    title: "Wiki Learning LMS",
    description:
      "A lightweight, offline-first Learning Management System designed for rural schools with low internet connectivity.",
    tags: ["Next.js", "PWA", "Node.js"],
    difficulty: "Intermediate",
    stars: 120,
    forks: 45,
    status: "Active",
    imageColor: "bg-blue-500",
    link: "#",
  },
  {
    id: 2,
    title: "EcoTrack Mobile App",
    description:
      "Flutter application to track daily carbon footprint. Needs help with UI implementation and gamification logic.",
    tags: ["Flutter", "Firebase", "Dart"],
    difficulty: "Beginner",
    stars: 85,
    forks: 12,
    status: "Looking for Maintainers",
    imageColor: "bg-green-500",
    link: "#",
  },
  {
    id: 3,
    title: "Open Health Dashboard",
    description:
      "Data visualization dashboard for public health statistics using government open APIs.",
    tags: ["React", "D3.js", "Python"],
    difficulty: "Advanced",
    stars: 230,
    forks: 60,
    status: "Active",
    imageColor: "bg-red-500",
    link: "#",
  },
  {
    id: 4,
    title: "CodeConnect CLI",
    description:
      "A command-line tool to help developers find 'good first issues' on GitHub based on their tech stack.",
    tags: ["Rust", "CLI", "API"],
    difficulty: "Intermediate",
    stars: 340,
    forks: 89,
    status: "Active",
    imageColor: "bg-purple-500",
    link: "#",
  },
  {
    id: 5,
    title: "Wiki Portfolio Template",
    description:
      "A customizable, minimal portfolio template for students to showcase their projects.",
    tags: ["HTML/CSS", "JavaScript"],
    difficulty: "Beginner",
    stars: 45,
    forks: 120,
    status: "Stable",
    imageColor: "bg-yellow-500",
    link: "#",
  },
  {
    id: 6,
    title: "AI Resume Scanner",
    description:
      "An AI-powered tool that compares resumes against job descriptions to suggest improvements.",
    tags: ["Python", "OpenAI", "React"],
    difficulty: "Advanced",
    stars: 560,
    forks: 102,
    status: "Active",
    imageColor: "bg-indigo-500",
    link: "#",
  },
];

const ALL_TAGS = [
  "All",
  "Next.js",
  "React",
  "Flutter",
  "Python",
  "Rust",
  "Node.js",
];
const ALL_DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

export default function ProjectsPage() {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // --- FILTER LOGIC ---
  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      selectedTag === "All" || project.tags.includes(selectedTag);
    const matchesDifficulty =
      selectedDifficulty === "All" || project.difficulty === selectedDifficulty;

    return matchesSearch && matchesTag && matchesDifficulty;
  });
  return (
    <div className=" min-h-screen flex  justify-center items-center text-gray-600  text-center w-screen">
      <h1>Projects Page Coming Soon!</h1>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     {/* --- HERO SECTION --- */}
  //     <section className="bg-white border-b border-gray-200">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
  //         <span className="inline-block py-1 px-3 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-bold tracking-wide uppercase mb-4">
  //           Open Source
  //         </span>
  //         <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
  //           Build Real World <span className="text-brand-green">Projects</span>
  //         </h1>
  //         <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
  //           Don't just watch tutorials. Contribute to open-source software,
  //           collaborate with others, and build a portfolio that stands out.
  //         </p>

  //         {/* Search & Filter Bar */}
  //         <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-gray-200 flex flex-col md:flex-row gap-4">
  //           {/* Search Input */}
  //           <div className="flex-1 relative">
  //             <Search
  //               className="absolute left-4 top-3.5 text-gray-400"
  //               size={20}
  //             />
  //             <input
  //               type="text"
  //               placeholder="Search projects..."
  //               className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-transparent focus:bg-white focus:border-brand-blue focus:ring-0 transition-all outline-none"
  //               value={searchQuery}
  //               onChange={(e) => setSearchQuery(e.target.value)}
  //             />
  //           </div>

  //           {/* Filters */}
  //           <div className="flex gap-2">
  //             <select
  //               className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer hover:bg-gray-100"
  //               value={selectedDifficulty}
  //               onChange={(e) => setSelectedDifficulty(e.target.value)}
  //             >
  //               {ALL_DIFFICULTIES.map((d) => (
  //                 <option key={d} value={d}>
  //                   {d === "All" ? "Any Level" : d}
  //                 </option>
  //               ))}
  //             </select>

  //             <select
  //               className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer hover:bg-gray-100"
  //               value={selectedTag}
  //               onChange={(e) => setSelectedTag(e.target.value)}
  //             >
  //               {ALL_TAGS.map((t) => (
  //                 <option key={t} value={t}>
  //                   {t === "All" ? "All Tech" : t}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* --- PROJECTS GRID --- */}
  //     <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
  //       {/* Results Count */}
  //       <div className="mb-8 flex justify-between items-center">
  //         <p className="text-gray-500">
  //           Showing{" "}
  //           <span className="font-bold text-gray-900">
  //             {filteredProjects.length}
  //           </span>{" "}
  //           active projects
  //         </p>
  //         <Link
  //           href="/contact"
  //           className="text-sm font-semibold text-brand-blue hover:underline"
  //         >
  //           Submit your own project &rarr;
  //         </Link>
  //       </div>

  //       {/* Grid */}
  //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  //         {filteredProjects.map((project) => (
  //           <div
  //             key={project.id}
  //             className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full"
  //           >
  //             {/* Card Header */}
  //             <div className="p-6 pb-4">
  //               <div className="flex justify-between items-start mb-4">
  //                 {/* Icon Placeholder */}
  //                 <div
  //                   className={clsx(
  //                     "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md",
  //                     project.imageColor
  //                   )}
  //                 >
  //                   <Code2 size={24} />
  //                 </div>

  //                 {/* Difficulty Badge */}
  //                 <span
  //                   className={clsx(
  //                     "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
  //                     project.difficulty === "Beginner" &&
  //                       "bg-green-100 text-green-700",
  //                     project.difficulty === "Intermediate" &&
  //                       "bg-blue-100 text-blue-700",
  //                     project.difficulty === "Advanced" &&
  //                       "bg-red-100 text-red-700"
  //                   )}
  //                 >
  //                   {project.difficulty}
  //                 </span>
  //               </div>

  //               <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
  //                 {project.title}
  //               </h3>
  //               <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
  //                 {project.description}
  //               </p>
  //             </div>

  //             {/* Tags & Stats */}
  //             <div className="px-6 flex-1">
  //               <div className="flex flex-wrap gap-2 mb-6">
  //                 {project.tags.map((tag) => (
  //                   <span
  //                     key={tag}
  //                     className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs font-medium text-gray-500"
  //                   >
  //                     {tag}
  //                   </span>
  //                 ))}
  //               </div>
  //             </div>

  //             {/* Footer / Actions */}
  //             <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
  //               <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
  //                 <span className="flex items-center gap-1 hover:text-yellow-600 cursor-default">
  //                   <Star size={16} className="text-yellow-400 fill-current" />{" "}
  //                   {project.stars}
  //                 </span>
  //                 <span className="flex items-center gap-1 hover:text-brand-blue cursor-default">
  //                   <GitFork size={16} /> {project.forks}
  //                 </span>
  //               </div>

  //               <div className="flex gap-2">
  //                 <Link
  //                   href={project.link}
  //                   className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
  //                   title="View Code"
  //                 >
  //                   <Github size={20} />
  //                 </Link>
  //                 <Link
  //                   href={project.link}
  //                   className="p-2 text-brand-blue hover:text-white hover:bg-brand-blue rounded-lg transition-colors"
  //                   title="Live Demo"
  //                 >
  //                   <ExternalLink size={20} />
  //                 </Link>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>

  //       {/* Empty State */}
  //       {filteredProjects.length === 0 && (
  //         <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
  //           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
  //             <Filter size={32} />
  //           </div>
  //           <h3 className="text-lg font-bold text-gray-900">
  //             No projects found
  //           </h3>
  //           <p className="text-gray-500">
  //             Try adjusting your search or filters.
  //           </p>
  //           <button
  //             onClick={() => {
  //               setSearchQuery("");
  //               setSelectedTag("All");
  //               setSelectedDifficulty("All");
  //             }}
  //             className="mt-4 text-brand-blue font-semibold hover:underline"
  //           >
  //             Clear all filters
  //           </button>
  //         </div>
  //       )}
  //     </section>
  //   </div>
  // );
}

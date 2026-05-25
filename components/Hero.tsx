"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion"; // Import this

export default function Hero() {
  const words = ["Everyone", "Students", "Mentors", "Developers"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 2500); // Increased speed to 2.5s (1s is too fast for reading)

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center py-16 md:py-24 gap-12">
          <div className="flex-1 text-center md:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight font-sans">
                Open Learning for <br />
                {/* ANIMATION WRAPPER */}
                <span className="text-brand-blue inline-flex h-[1.1em] overflow-hidden relative w-full md:w-auto justify-center md:justify-start">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={words[index]} // Key triggers the animation on change
                      initial={{ y: 20, opacity: 0 }} // Start: Below & Invisible
                      animate={{ y: 0, opacity: 1 }} // End: Center & Visible
                      exit={{ y: -20, opacity: 0 }} // Leave: Up & Invisible
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute"
                    >
                      {words[index]}
                    </motion.span>
                  </AnimatePresence>

                  {/* Invisible spacer to keep width correct based on longest word */}
                  <span className="invisible">Developers</span>
                </span>
                <br className="md:hidden" />
                <span className="text-gray-900">, Everywhere.</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0 font-sans leading-relaxed">
                Join{" "}
                <span className="font-bold text-brand-red">
                  Wiki Open Learning
                </span>{" "}
                to collaborate on projects, attend workshops, and share
                knowledge without barriers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href="/events"
                className="px-8 py-4 rounded-lg bg-brand-red text-white font-bold text-lg hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
              >
                Explore Events
              </Link>
              <Link
                href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning#"
                className="px-8 py-4 rounded-lg border-2 border-brand-blue text-brand-blue font-bold text-lg hover:bg-brand-blue hover:text-white transition-colors"
              >
                Meta Page
              </Link>
            </div>
          </div>

          <Image
            quality={100}
            src={"/hero.png"}
            alt="Wiki Open Learning Hero"
            width={300}
            height={300}
            className="flex-1 relative w-full flex justify-center md:justify-end rounded-2xl object-contain"
          />
        </div>
      </div>
    </section>
  );
}

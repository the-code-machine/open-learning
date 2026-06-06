"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Send, ArrowRight, Puzzle, Edit3 } from "lucide-react";

/**
 * Hero — styled as a Wikipedia "stub" template.
 *
 * Wikipedia marks incomplete articles with a small orange/cream box that
 * says: "This article is a stub. You can help Wikipedia by expanding it."
 * Every editor recognises it instantly. This hero IS that box, scaled up to
 * page size, with the project itself framed as the stub that the visitor
 * can help expand. The aesthetic is faithful to Wikipedia's stub palette
 * (cream/amber) so the reference reads; the rest of the site stays on the
 * site's blue/green/red brand. Mobile-first, no hero image.
 */

const PROMPTS = [
  "...by attending an event.",
  "...by recording a tutorial.",
  "...by hosting a workshop.",
  "...by editing your first article.",
  "...by joining a working group.",
];

export default function Hero() {
  const [pi, setPi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPi((i) => (i + 1) % PROMPTS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full bg-white pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* subtle paper-grid backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1F4E79 1px, transparent 1px), linear-gradient(to bottom, #1F4E79 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* WOL logo — top right corner. Plain <img> intentionally (Next's
            Image component blocks external SVGs without config; this one
            file is hosted on Commons and is the project's own brand mark). */}
        <a
          href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Wiki Open Learning on Meta-Wiki"
          className="absolute top-0 right-4 sm:right-6 lg:right-8 z-10 opacity-80 hover:opacity-100 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Wiki_Open_Learning_Black_SVG_Logo.svg"
            alt="Wiki Open Learning"
            className="h-14 sm:h-20 w-auto"
          />
        </a>

        {/* tiny meta line, like the breadcrumb above a Wikipedia article */}
        <p className="text-xs text-gray-400 mb-3 font-mono pr-20 sm:pr-24">
          From Meta-Wiki · A community initiative
        </p>

        {/* the article "title" */}
        <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4 leading-tight">
          Wiki Open Learning
        </h1>

        {/* the "lead paragraph" — Wikipedia opens articles like this */}
        <p className="font-serif text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mb-8">
          <span className="font-bold">Wiki Open Learning</span> (
          <span className="italic">WOL</span>) is an open Wikimedia community
          initiative supporting contributor growth through workshops,
          edit-a-thons, tutorials, and learning events. Activities are organised
          into eight thematic areas covering the full lifecycle of being a
          Wikimedia contributor.
          <sup className="text-brand-blue font-sans text-sm">[1]</sup>
        </p>

        {/* THE STUB BOX — the punchline */}
        <div
          role="note"
          aria-label="Stub-styled call to action"
          className="relative my-10 mx-auto"
        >
          {/* the colored left bar, classic stub-template */}
          <div className="flex items-stretch rounded-md overflow-hidden border border-amber-300 shadow-sm">
            <div
              className="w-1.5 md:w-2 shrink-0 bg-amber-500"
              aria-hidden="true"
            />
            <div className="flex-1 bg-amber-50 p-4 md:p-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-md bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                  <Puzzle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-amber-950 leading-relaxed">
                    <span className="italic">
                      Open learning across the Wikimedia movement is a community
                      effort.{" "}
                    </span>
                    <span className="font-bold">You can help by joining</span>
                    <span className="italic text-amber-800 inline-block ml-1 min-w-[12ch] transition-opacity duration-300">
                      {PROMPTS[pi]}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* footnote — that small italic "expand" / "edit" line under stub boxes */}
          <div className="flex items-center justify-end gap-3 mt-2 px-2 text-xs">
            <span className="text-gray-400 italic">
              v. {new Date().getFullYear()} · cc by-sa 4.0
            </span>
            <a
              href="https://meta.wikimedia.org/wiki/Talk:Wiki_Open_Learning"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:text-brand-green underline-offset-2 hover:underline font-mono"
            >
              [ edit ]
            </a>
          </div>
        </div>

        {/* primary actions, styled clean and minimal */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-brand-blue text-white font-bold hover:bg-brand-green transition-colors shadow-sm"
          >
            <Edit3 size={17} /> Start expanding
          </Link>
          <Link
            href="https://t.me/wikiopenlearning"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md border border-gray-300 text-gray-700 font-bold hover:border-brand-blue hover:text-brand-blue transition-colors"
          >
            <Send size={17} /> Join on Telegram
          </Link>
          <Link
            href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-gray-600 font-semibold hover:text-brand-blue transition-colors"
          >
            Read on Meta-Wiki <ArrowRight size={16} />
          </Link>
        </div>

        {/* the tiny footnote referenced as [1] above — completes the gag */}
        <p className="mt-12 text-xs text-gray-400 font-mono border-t border-gray-100 pt-4 max-w-3xl">
          <sup className="text-brand-blue">[1]</sup>{" "}
          <a
            href="https://meta.wikimedia.org/wiki/Wiki_Open_Learning"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-blue hover:underline"
          >
            "Wiki Open Learning"
          </a>
          . Meta-Wiki. Retrieved{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
          .
        </p>
      </div>
    </section>
  );
}

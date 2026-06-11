"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import CreateMetaPageModal from "./CreateMetaPageModal";

/**
 * Bottom-of-event-page CTA. Opens the participant-aware modal.
 * Needs the eventId so the modal can look up registered participants.
 */
export default function CreateMetaPageCTA({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue via-brand-blue to-brand-green text-white p-8 md:p-12 shadow-xl">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide uppercase mb-3">
                <Sparkles size={13} /> New • For attendees
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                Create your Meta-Wiki page
              </h2>
              <p className="text-blue-100 leading-relaxed max-w-xl">
                We&apos;ll find you in the registration list and pre-fill your
                Meta-Wiki user page with your details, photo, and the{" "}
                <code className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono text-sm">
                  {"{{User WOL}}"}
                </code>{" "}
                userbox. You just click Publish on Meta.
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-blue font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg shrink-0 whitespace-nowrap"
            >
              <BookOpen size={18} /> Create my page
            </button>
          </div>
        </div>
      </section>

      <CreateMetaPageModal
        eventId={eventId}
        eventName={eventName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

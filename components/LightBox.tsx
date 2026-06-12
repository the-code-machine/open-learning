"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

/**
 * Lightbox v2 — faster image swap + neighbor preloading.
 *
 * Performance changes from v1:
 *   1. Display the thumbnail URL immediately for instant feedback. Then load
 *      the full-resolution URL in the background and swap when ready. This
 *      means navigation feels instant even on slow connections.
 *   2. Preload the next and previous images as soon as you land on one, so
 *      clicking next/prev shows the new image without a network wait.
 *   3. A small loading spinner appears in the corner while the high-res
 *      version is still downloading — so users know it's working.
 */

export interface LightboxImage {
  /** Full-resolution URL — shown after thumb finishes loading */
  url: string;
  /** Smaller thumbnail URL — shown immediately. Falls back to `url` if absent. */
  thumbUrl?: string;
  caption?: string;
  sourceUrl?: string;
}

interface Props {
  images: LightboxImage[];
  openIndex: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

export default function Lightbox({
  images,
  openIndex,
  onClose,
  onIndexChange,
}: Props) {
  const total = images.length;
  const current = openIndex !== null ? images[openIndex] : null;

  /** What's actually on screen right now. Starts as the thumb of the current
   *  image (instant), upgrades to full-res once loaded. */
  const [displayedUrl, setDisplayedUrl] = useState<string>("");
  const [highResLoading, setHighResLoading] = useState(false);

  /** Track which index we're currently showing so a slow load from a
   *  previous image can't overwrite the new one when user clicks fast. */
  const activeIndex = useRef<number | null>(null);

  /* --- when openIndex changes, switch displayed image immediately --- */
  useEffect(() => {
    if (openIndex === null || !current) return;
    activeIndex.current = openIndex;

    // Start with the thumb (or full-res if no thumb available) for instant render
    const initialUrl = current.thumbUrl || current.url;
    setDisplayedUrl(initialUrl);

    // If thumb and full-res differ, upgrade in background
    if (current.thumbUrl && current.thumbUrl !== current.url) {
      setHighResLoading(true);
      const img = new Image();
      img.src = current.url;
      img.onload = () => {
        // Only swap if user hasn't navigated away in the meantime
        if (activeIndex.current === openIndex) {
          setDisplayedUrl(current.url);
          setHighResLoading(false);
        }
      };
      img.onerror = () => {
        if (activeIndex.current === openIndex) {
          setHighResLoading(false);
        }
      };
    } else {
      setHighResLoading(false);
    }
  }, [openIndex, current]);

  /* --- preload neighbors so prev/next feel instant --- */
  useEffect(() => {
    if (openIndex === null) return;
    const neighborIndices = [
      (openIndex + 1) % total,
      (openIndex - 1 + total) % total,
    ];
    for (const i of neighborIndices) {
      const n = images[i];
      if (!n) continue;
      // Preload the thumb (fast) — full-res loads on demand
      const img = new Image();
      img.src = n.thumbUrl || n.url;
    }
  }, [openIndex, total, images]);

  const goPrev = useCallback(() => {
    if (openIndex === null || total === 0) return;
    onIndexChange((openIndex - 1 + total) % total);
  }, [openIndex, total, onIndexChange]);

  const goNext = useCallback(() => {
    if (openIndex === null || total === 0) return;
    onIndexChange((openIndex + 1) % total);
  }, [openIndex, total, onIndexChange]);

  /* --- keyboard nav + scroll lock --- */
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openIndex, onClose, goPrev, goNext]);

  if (openIndex === null || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[999999999]! bg-black/95 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* counter + loading indicator */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10 inline-flex items-center gap-2 text-white/80 text-xs sm:text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-full">
        <span>
          {openIndex + 1} / {total}
        </span>
        {highResLoading && (
          <Loader2 size={12} className="animate-spin opacity-70" />
        )}
      </div>

      {/* prev */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* next */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* image */}
      <div
        className="relative max-w-full max-h-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={openIndex}
          src={displayedUrl}
          alt={current.caption ?? `Image ${openIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        {(current.caption || current.sourceUrl) && (
          <div className="mt-3 text-center text-white/85 max-w-2xl px-2">
            {current.caption && (
              <p className="text-sm leading-snug">{current.caption}</p>
            )}
            {current.sourceUrl && (
              <a
                href={current.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-white/60 hover:text-white transition-colors"
              >
                <ExternalLink size={11} /> View on Wikimedia Commons
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

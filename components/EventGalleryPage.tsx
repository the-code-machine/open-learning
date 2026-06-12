"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon, Loader2, AlertCircle, Plus } from "lucide-react";
import Lightbox, { type LightboxImage } from "./LightBox";
import type { GalleryImage, CommonsImage } from "@/lib/types";

/**
 * EventGallery v2 — passes thumbUrl to the lightbox so it can render fast
 * with progressive upgrade to full-res. Also drops broken-image tiles by
 * hiding any image that fails to load (covers any Commons file we somehow
 * still let through despite the upstream filter).
 */

interface InitialPage {
  category: string;
  images: CommonsImage[];
  next: string | null;
  error?: string;
}

interface Props {
  manual: GalleryImage[];
  commons: InitialPage[];
}

export default function EventGallery({ manual, commons }: Props) {
  const [categoryState, setCategoryState] = useState<
    Record<
      string,
      {
        images: CommonsImage[];
        next: string | null;
        loading: boolean;
        error?: string;
      }
    >
  >(
    Object.fromEntries(
      commons.map((c) => [
        c.category,
        {
          images: c.images,
          next: c.next,
          loading: false,
          error: c.error,
        },
      ]),
    ),
  );

  /** Images that failed to load (browser-side) — we hide their tiles */
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(new Set());

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  /* flat list for the lightbox — manual first, then commons in category
     order. Used for lightbox indexing. Excludes broken tiles. */
  const visibleManual = manual.filter((m) => !brokenUrls.has(m.url));
  const visibleCommons = commons.flatMap((c) => {
    const state = categoryState[c.category];
    if (!state) return [];
    return state.images.filter((img) => !brokenUrls.has(img.thumbUrl));
  });

  const allImages: LightboxImage[] = [
    ...visibleManual.map((m) => ({
      url: m.url,
      thumbUrl: m.url,
      caption: m.caption,
    })),
    ...visibleCommons.map((img) => ({
      url: img.url,
      thumbUrl: img.thumbUrl,
      caption: img.title.replace(/^File:/, "").replace(/_/g, " "),
      sourceUrl: img.descriptionUrl,
    })),
  ];

  const markBroken = (url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const loadMore = useCallback(
    async (category: string) => {
      setCategoryState((prev) => ({
        ...prev,
        [category]: { ...prev[category], loading: true, error: undefined },
      }));

      const cursor = categoryState[category]?.next;
      if (!cursor) return;

      try {
        const res = await fetch(
          `/api/commons-images?category=${encodeURIComponent(category)}&cursor=${encodeURIComponent(cursor)}`,
        );
        const data: {
          images: CommonsImage[];
          next: string | null;
          error?: string;
        } = await res.json();

        setCategoryState((prev) => {
          const existing = prev[category];
          const seen = new Set(existing.images.map((i) => i.title));
          const newOnes = data.images.filter((i) => !seen.has(i.title));
          return {
            ...prev,
            [category]: {
              images: [...existing.images, ...newOnes],
              next: data.next,
              loading: false,
              error: data.error,
            },
          };
        });
      } catch (e) {
        setCategoryState((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            loading: false,
            error: (e as Error).message || "Failed to load",
          },
        }));
      }
    },
    [categoryState],
  );

  if (allImages.length === 0 && commons.every((c) => !c.error)) return null;

  const tile =
    "group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-100 hover:border-brand-blue transition-all";
  let globalIndex = 0;

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon className="text-brand-blue" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
        <span className="text-sm text-gray-400 font-normal ml-1">
          {allImages.length} {allImages.length === 1 ? "image" : "images"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {manual.map((img, i) => {
          if (brokenUrls.has(img.url)) return null;
          const idx = globalIndex++;
          return (
            <button
              key={`manual-${i}`}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className={tile}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption ?? `Gallery image ${i + 1}`}
                loading="lazy"
                onError={() => markBroken(img.url)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </div>
              )}
            </button>
          );
        })}

        {commons.flatMap((c) => {
          const state = categoryState[c.category];
          if (!state) return [];
          return state.images.map((img, i) => {
            if (brokenUrls.has(img.thumbUrl)) return null;
            const idx = globalIndex++;
            const cleanTitle = img.title
              .replace(/^File:/, "")
              .replace(/_/g, " ");
            return (
              <button
                key={`${c.category}-${img.title}-${i}`}
                type="button"
                onClick={() => setOpenIndex(idx)}
                className={tile}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbUrl}
                  alt={cleanTitle}
                  loading="lazy"
                  onError={() => markBroken(img.thumbUrl)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] sm:text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                  {cleanTitle}
                </div>
              </button>
            );
          });
        })}
      </div>

      <div className="mt-6 space-y-2">
        {commons.map((c) => {
          const state = categoryState[c.category];
          if (!state) return null;
          if (state.error) {
            return (
              <div
                key={c.category}
                className="flex items-center gap-2 text-xs text-brand-red bg-red-50 border border-red-100 rounded-lg p-3"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>
                  Couldn&apos;t load &quot;{c.category}&quot;: {state.error}
                </span>
              </div>
            );
          }
          if (!state.next) return null;
          return (
            <button
              key={c.category}
              type="button"
              onClick={() => loadMore(c.category)}
              disabled={state.loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-brand-blue hover:text-brand-blue transition-colors text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading more from {c.category}…
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Load more from {c.category}
                </>
              )}
            </button>
          );
        })}
      </div>

      <Lightbox
        images={allImages}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </div>
  );
}

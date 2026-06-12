/**
 * Wikimedia Commons API fetcher with caching.
 *
 * v2 changes:
 *   - Filter out non-image MIME types (PDFs, audio, video, generic files) so
 *     they don't render as broken text-only tiles in the gallery.
 *   - Skip individual files where Commons couldn't generate a thumbnail
 *     (e.g. very large originals, malformed source files). The category as
 *     a whole still loads; just the unrenderable item is dropped.
 *   - Treat "Could not normalize image parameters" type errors as expected
 *     per-file conditions rather than category-level failures.
 */

import type { CommonsImage } from "./types";

const API = "https://commons.wikimedia.org/w/api.php";
const REVALIDATE_SECONDS = 300;
const PAGE_SIZE = 50;
const HARD_LIMIT = 500;

/** Extensions Commons can render thumbnails for. We filter at this layer
 *  rather than relying on API metadata because Commons' MIME detection is
 *  inconsistent and some valid files lack a `mime` field. */
const RENDERABLE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "tiff",
  "tif",
]);

export interface CommonsFetchResult {
  images: CommonsImage[];
  next: string | null;
  error?: string;
}

function normalizeCategory(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^category:/i.test(trimmed)) return trimmed;
  return `Category:${trimmed}`;
}

function isRenderableFile(title: string): boolean {
  const m = title.match(/\.([a-z0-9]+)$/i);
  if (!m) return false;
  return RENDERABLE_EXTENSIONS.has(m[1].toLowerCase());
}

export async function fetchCommonsImages(
  rawCategory: string,
  cursor: string | null = null,
): Promise<CommonsFetchResult> {
  const category = normalizeCategory(rawCategory);
  if (!category) return { images: [], next: null };

  const params = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "categorymembers",
    gcmtitle: category,
    gcmtype: "file",
    gcmlimit: String(PAGE_SIZE),
    prop: "imageinfo",
    iiprop: "url|size|mime",
    iiurlwidth: "800",
    origin: "*",
  });

  if (cursor) {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, "base64").toString("utf-8"),
      );
      if (decoded?.gcmcontinue) {
        params.set("gcmcontinue", decoded.gcmcontinue);
      }
    } catch {
      /* bad cursor — restart */
    }
  }

  let data: unknown;
  try {
    const res = await fetch(`${API}?${params.toString()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "WikiOpenLearning/1.0" },
    });
    if (!res.ok) {
      return {
        images: [],
        next: null,
        error: `Commons API returned ${res.status}`,
      };
    }
    data = await res.json();
  } catch (e) {
    return {
      images: [],
      next: null,
      error: (e as Error).message || "Network error",
    };
  }

  const obj = data as {
    error?: { info?: string };
    query?: {
      pages?: Record<
        string,
        {
          title?: string;
          imageinfo?: Array<{
            url?: string;
            thumburl?: string;
            descriptionurl?: string;
            width?: number;
            height?: number;
            thumbwidth?: number;
            thumbheight?: number;
            mime?: string;
          }>;
        }
      >;
    };
    continue?: { gcmcontinue?: string };
  };

  // A top-level API error (rate limit, server fault) is a real category-level
  // failure — surface it. Per-file thumbnail-generation failures don't show up
  // here; they show up as missing `thumburl` on individual entries.
  if (obj.error) {
    const info = obj.error.info ?? "Unknown error";
    // Don't surface "could not normalize" — that's a per-file Commons quirk,
    // typically PDFs and obscure formats. Just drop those files.
    if (/normalize image parameters/i.test(info)) {
      return { images: [], next: null };
    }
    return { images: [], next: null, error: info };
  }

  const pages = obj.query?.pages ?? {};
  const images: CommonsImage[] = Object.values(pages)
    .map((p) => {
      const info = p.imageinfo?.[0];
      const title = p.title ?? "";
      // Skip files Commons couldn't thumbnail OR file types we can't render
      // (PDFs, audio, etc). thumburl is the signal: if it's missing the file
      // can't be displayed as an inline image.
      if (!info?.thumburl) return null;
      if (info.mime && !info.mime.startsWith("image/")) return null;
      if (!isRenderableFile(title)) return null;
      return {
        title,
        url: info.url ?? info.thumburl,
        thumbUrl: info.thumburl,
        width: info.thumbwidth ?? info.width ?? 0,
        height: info.thumbheight ?? info.height ?? 0,
        descriptionUrl: info.descriptionurl ?? "",
      } as CommonsImage;
    })
    .filter((x): x is CommonsImage => x !== null)
    .sort((a, b) => a.title.localeCompare(b.title));

  let next: string | null = null;
  if (obj.continue?.gcmcontinue) {
    next = Buffer.from(
      JSON.stringify({ gcmcontinue: obj.continue.gcmcontinue }),
      "utf-8",
    ).toString("base64");
  }

  return { images, next };
}

export async function fetchAllCommonsImagesForEvent(
  categories: string[],
): Promise<CommonsImage[]> {
  if (categories.length === 0) return [];
  const allResults = await Promise.all(
    categories.map((c) => fetchCommonsImages(c, null)),
  );
  const seen = new Set<string>();
  const merged: CommonsImage[] = [];
  for (const r of allResults) {
    for (const img of r.images) {
      if (!seen.has(img.title)) {
        seen.add(img.title);
        merged.push(img);
        if (merged.length >= HARD_LIMIT) break;
      }
    }
    if (merged.length >= HARD_LIMIT) break;
  }
  return merged;
}

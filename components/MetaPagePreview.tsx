"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

/**
 * MetaPagePreview
 *
 * Renders a live preview of wikitext as it would appear on Meta-Wiki, by
 * calling MediaWiki's parse API (action=parse) and injecting the returned
 * HTML into a sandboxed iframe along with Meta-Wiki's own stylesheets.
 *
 * Iframe isolation keeps Meta-Wiki's heavy Vector CSS from colliding with
 * our Tailwind setup. The fetch is debounced 350ms after the last keystroke
 * and previous in-flight requests are aborted before new ones start.
 */

interface Props {
  wikitext: string;
}

const META_API = "https://meta.wikimedia.org/w/api.php";
const DEBOUNCE_MS = 350;

export default function MetaPagePreview({ wikitext }: Props) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!wikitext.trim()) {
      setHtml("");
      setError(null);
      setLoading(false);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (abortRef.current) abortRef.current.abort();
    debounceTimer.current = setTimeout(() => {
      void fetchPreview(wikitext);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wikitext]);

  async function fetchPreview(text: string) {
    setLoading(true);
    setError(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const params = new URLSearchParams({
        action: "parse",
        format: "json",
        text,
        contentmodel: "wikitext",
        prop: "text",
        origin: "*",
        disablelimitreport: "1",
        disableeditsection: "1",
      });
      const res = await fetch(`${META_API}?${params.toString()}`, {
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`Meta-Wiki API returned ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.info ?? "Parse failed");
      const raw: string = data?.parse?.text?.["*"] ?? "";
      const fixed = raw
        .replace(/href="\/wiki\//g, 'href="https://meta.wikimedia.org/wiki/')
        .replace(/href="\/w\//g, 'href="https://meta.wikimedia.org/w/')
        .replace(/src="\/\//g, 'src="https://')
        .replace(/href="\/\//g, 'href="https://');
      setHtml(fixed);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Failed to render preview.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    if (!html) {
      doc.open();
      doc.write(emptyDoc());
      doc.close();
      return;
    }
    doc.open();
    doc.write(previewDoc(html));
    doc.close();
  }, [html]);

  return (
    <div className="meta-preview-root flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-700">Live preview</span>
          <span className="text-gray-400 truncate hidden sm:inline">
            (rendered by Meta-Wiki)
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {loading && (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <Loader2 size={12} className="animate-spin" /> rendering
            </span>
          )}
          {!loading && !error && html && (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> live
            </span>
          )}
          {error && (
            <button
              type="button"
              onClick={() => void fetchPreview(wikitext)}
              className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-green font-semibold"
            >
              <RefreshCw size={12} /> retry
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-100 text-xs text-brand-red flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold">Couldn&apos;t reach Meta-Wiki</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        title="Meta-Wiki preview"
        sandbox="allow-same-origin allow-popups"
        className="flex-1 w-full border-0 bg-white"
      />
    </div>
  );
}

function emptyDoc(): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
  body{margin:0;padding:48px 24px;font-family:'Linux Libertine','Georgia','Times',serif;color:#54595d;background:#fff;text-align:center}
  .empty{font-size:14px;font-style:italic;color:#a2a9b1}
  .empty-sub{font-size:12px;color:#c8ccd1;margin-top:6px}
</style></head><body>
  <div class="empty">Start typing to see your Meta-Wiki page appear here</div>
  <div class="empty-sub">Updates live as you change details</div>
</body></html>`;
}

function previewDoc(parserHtml: string): string {
  const stylesUrl =
    "https://meta.wikimedia.org/w/load.php?lang=en&modules=" +
    "site.styles%7Cext.cite.styles%7Cext.discussionTools.init.styles%7C" +
    "mediawiki.skinning.content.parsoid%7Cskins.vector.styles" +
    "&only=styles&skin=vector";

  return `<!doctype html><html><head><meta charset="utf-8">
<base href="https://meta.wikimedia.org/">
<link rel="stylesheet" href="${stylesUrl}">
<style>
  html, body { margin: 0; padding: 0; background: #fff; }
  body {
    font-family: 'Linux Libertine','Georgia','Times',serif;
    color: #202122;
    padding: 20px 28px 60px;
    line-height: 1.6;
  }
  .mw-parser-output {
    font-size: 14.4px;
    max-width: 100%;
  }
  .mw-parser-output::after {
    content: ""; display: block; clear: both;
  }
  /* Userboxes — Meta loads these via TemplateStyles, but as a fallback we
     style any unstyled userbox table so it's recognizable. */
  .userbox, table.userbox {
    border: 1px solid #a2a9b1;
    background: #f8f9fa;
    font-size: 12px;
    margin-bottom: 6px;
  }
  /* Float-right containers — DO NOT cap width here, the inline style is the
     source of truth (our wikitext sets 260px for the userbox stack and 180px
     for the photo block). */
  div[style*="float:right"], div[style*="float: right"] {
    margin: 0 0 1em 1em !important;
  }
  div[style*="float:right"] img, div[style*="float: right"] img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  /* Heading style — Meta-Wiki's familiar bordered h2 */
  .mw-parser-output h2 {
    border-bottom: 1px solid #a2a9b1;
    margin: 1em 0 0.5em;
    padding-bottom: 0.17em;
    font-family: 'Linux Libertine','Georgia','Times',serif;
    font-size: 1.6em;
    font-weight: normal;
  }
  .mw-parser-output h3 {
    font-size: 1.2em;
    font-weight: bold;
  }
  a.new { color: #ba0000; }
  .mw-parser-output ul { margin: 0.3em 0 0.3em 1.6em; }
  hr { margin: 1em 0; }
  img { max-width: 100%; height: auto; }
</style></head>
<body>
<div class="mw-body-content"><div class="mw-parser-output">${parserHtml}</div></div>
</body></html>`;
}

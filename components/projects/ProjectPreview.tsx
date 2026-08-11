"use client";
import { useState } from "react";
import type { Project } from "@/data/projects";

/*
  Interactive preview for projects with a live URL.

  The iframe is click-to-load rather than eager: embedding several third-party
  sites on page load would pull their full weight into this page, and some
  hosts refuse to frame at all. Loading on intent keeps the page fast and makes
  a refusal the user's explicit action rather than a silent blank box.

  Sandboxed to scripts and same-origin so the embedded site runs normally but
  cannot navigate this page or open popups. If a host sends
  X-Frame-Options/frame-ancestors the frame stays blank, so the direct link is
  always offered alongside it.
*/
export function ProjectPreview({ project }: { project: Project }) {
  const [loaded, setLoaded] = useState(false);

  if (!project.liveUrl) return null;

  const host = (() => {
    try {
      return new URL(project.liveUrl).host;
    } catch {
      return project.liveUrl;
    }
  })();

  return (
    <figure className="overflow-hidden border border-line">
      {/* Browser chrome, so the embed reads as a window rather than a raw frame */}
      <div className="flex items-center gap-3 border-b border-line bg-panel px-3 py-2">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-line-bright" />
          <span className="h-2 w-2 rounded-full bg-line-bright" />
          <span className="h-2 w-2 rounded-full bg-line-bright" />
        </span>
        <span className="truncate font-mono text-label text-ink-dim">{host}</span>
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto shrink-0 font-mono text-label uppercase text-ink-faint transition-colors hover:text-ink"
        >
          Open ↗
        </a>
      </div>

      <div className="relative aspect-[16/10] bg-graphite">
        {loaded ? (
          <iframe
            src={project.liveUrl}
            title={`${project.title} live preview`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms"
            referrerPolicy="no-referrer"
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <button
            onClick={() => setLoaded(true)}
            className="group flex h-full w-full flex-col items-center justify-center gap-3 outline-none transition-colors hover:bg-panel/60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-bright text-ink transition-colors group-hover:border-ink">
              ▶
            </span>
            <span className="font-mono text-label uppercase text-ink-dim transition-colors group-hover:text-ink">
              Load live preview
            </span>
            <span className="font-mono text-label text-ink-faint">
              Loads {host} in a sandboxed frame
            </span>
          </button>
        )}
      </div>

      <figcaption className="border-t border-line px-3 py-2 font-mono text-label text-ink-faint">
        Live site. If the frame stays blank, the host blocks embedding. Use Open.
      </figcaption>
    </figure>
  );
}

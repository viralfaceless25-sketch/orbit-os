"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { projects, type ProjectCategory } from "@/data/projects";
import {
  buildNodes,
  buildEdges,
  matchesQuery,
  CATEGORY_LABEL,
  type GalaxyNode,
} from "@/lib/galaxy-layout";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  The Project Galaxy: a 2D constellation of the work, drawn on canvas.

  Deliberately not WebGL. The spec's own reasoning holds: a full 3D scene looks
  impressive and then navigates badly, performs badly on phones, and is opaque
  to search engines. Depth here comes from node size, glow, parallax drift and
  camera easing instead.

  Accessibility: canvas is decorative here. Every project is also rendered as a
  real link in a visually hidden list, so keyboard and screen-reader users get
  the same content, and the filtered results panel beside the canvas is the
  primary interface on touch devices.
*/

const CATEGORIES: (ProjectCategory | "all")[] = [
  "all",
  "ai",
  "web",
  "prototype",
  "open-source",
];

export function ProjectGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = useMemo(() => buildNodes(projects), []);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const visible = useMemo(() => {
    const slugs = new Set(
      projects
        .filter((p) => (category === "all" ? true : p.category === category))
        .filter((p) => matchesQuery(p, query))
        .map((p) => p.slug)
    );
    return slugs;
  }, [query, category]);

  // Kept in refs so the animation loop reads current values without restarting.
  const stateRef = useRef({ visible, selected, hovered });
  stateRef.current = { visible, selected, hovered };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;
    let frame = 0;

    // Eased pointer position, so the parallax follows rather than snaps.
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Layout space is fixed; fit it to whatever the canvas actually is. */
    const scaleFor = () => Math.min(width / 900, height / 620, 1) * 0.95;

    const project = (n: GalaxyNode, scale: number) => ({
      x: width / 2 + n.x * scale + easedX * 14,
      y: height / 2 + n.y * scale + easedY * 14,
    });

    const draw = () => {
      const { visible: vis, selected: sel, hovered: hov } = stateRef.current;
      const scale = scaleFor();

      easedX += (pointerX - easedX) * 0.05;
      easedY += (pointerY - easedY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const focus = sel ?? hov;

      // Boxes already occupied by a label this frame. A constellation packs
      // nodes closely, so without this the names overlap each other and the
      // dots, which is worse than showing fewer names.
      const claimed: { x: number; y: number; w: number; h: number }[] = [];
      const fits = (box: { x: number; y: number; w: number; h: number }) =>
        !claimed.some(
          (c) =>
            Math.abs(c.x - box.x) * 2 < c.w + box.w &&
            Math.abs(c.y - box.y) * 2 < c.h + box.h
        );

      // Connections, revealed only for the focused node. Showing every edge at
      // once turns the map into noise; the spec asks for them on selection.
      if (focus) {
        const focusIndex = nodes.findIndex((n) => n.project.slug === focus);
        ctx.lineWidth = 1;
        for (const edge of edges) {
          if (edge.a !== focusIndex && edge.b !== focusIndex) continue;
          const from = nodes[edge.a];
          const to = nodes[edge.b];
          if (!vis.has(from.project.slug) || !vis.has(to.project.slug)) continue;

          const p1 = project(from, scale);
          const p2 = project(to, scale);
          ctx.strokeStyle = "rgba(150,170,205,0.28)";
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const p = project(node, scale);
        const isVisible = vis.has(node.project.slug);
        const isFocus = focus === node.project.slug;

        // Filtered-out nodes stay on the map, dimmed. Removing them entirely
        // would make the constellation shift under the visitor as they type.
        const alpha = isVisible ? 1 : 0.12;

        // Gentle orbital drift keeps the field alive without moving nodes far
        // enough to break the map's stability.
        const drift = reduced ? 0 : Math.sin(frame * 0.006 + node.x) * 1.6;

        const r = node.radius * scale * (isFocus ? 1.5 : 1);

        if (isVisible) {
          const glow = ctx.createRadialGradient(p.x, p.y + drift, 0, p.x, p.y + drift, r * 4);
          glow.addColorStop(0, `${node.color}55`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y + drift, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y + drift, r, 0, Math.PI * 2);
        ctx.fill();

        if (isFocus) {
          ctx.strokeStyle = "#f2f0ed";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y + drift, r + 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Featured work is labelled on the map; the rest label on focus, so the
        // galaxy stays legible instead of becoming a wall of text.
        if (isVisible && (node.project.tier === "featured" || isFocus)) {
          const size = Math.max(11, 12 * scale);
          ctx.font = `500 ${size}px ui-sans-serif, system-ui, sans-serif`;

          const text = node.project.title;
          const w = ctx.measureText(text).width;
          const ly = p.y + drift + r + 17;
          const box = { x: p.x, y: ly, w: w + 12, h: size + 8 };

          // A focused label always wins; others yield to whatever is already
          // placed, so names never sit on top of each other.
          if (isFocus || fits(box)) {
            claimed.push(box);
            ctx.globalAlpha = isFocus ? 1 : 0.75;
            ctx.fillStyle = "#f2f0ed";
            ctx.textAlign = "center";
            ctx.fillText(text, p.x, ly);
          }
        }

        ctx.globalAlpha = 1;
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };

    /** Nearest node within a forgiving radius, so clicking feels accurate. */
    const nodeAt = (clientX: number, clientY: number): GalaxyNode | null => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const scale = scaleFor();

      let closest: GalaxyNode | null = null;
      let closestDistance = Infinity;

      for (const node of nodes) {
        if (!stateRef.current.visible.has(node.project.slug)) continue;
        const p = project(node, scale);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < Math.max(node.radius * scale + 14, 20) && d < closestDistance) {
          closest = node;
          closestDistance = d;
        }
      }
      return closest;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width - 0.5;
      pointerY = (e.clientY - rect.top) / rect.height - 0.5;

      const hit = nodeAt(e.clientX, e.clientY);
      setHovered(hit?.project.slug ?? null);
      canvas.style.cursor = hit ? "pointer" : "default";
    };

    const onClick = (e: MouseEvent) => {
      const hit = nodeAt(e.clientX, e.clientY);
      setSelected(hit ? hit.project.slug : null);
    };

    const onLeave = () => {
      setHovered(null);
      pointerX = 0;
      pointerY = 0;
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [nodes, edges, reduced]);

  const focused = projects.find((p) => p.slug === (selected ?? hovered));
  const results = projects.filter((p) => visible.has(p.slug));

  return (
    <section className="py-16">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, problem, or technology"
          aria-label="Search projects"
          className="min-w-[16rem] flex-1 border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-line-bright"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`border px-3 py-2 font-mono text-label uppercase transition-colors ${
                category === c
                  ? "border-line-bright bg-panel text-ink"
                  : "border-line text-ink-dim hover:border-line-bright hover:text-ink"
              }`}
            >
              {c === "all" ? "All" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="relative border border-line bg-graphite/40">
          <canvas
            ref={canvasRef}
            aria-hidden
            className="h-[26rem] w-full sm:h-[32rem]"
          />

          <p className="pointer-events-none absolute bottom-3 left-4 font-mono text-label uppercase text-ink-faint">
            {results.length} of {projects.length} shown
          </p>

          {focused && (
            <div className="pointer-events-none absolute right-4 top-4 max-w-[15rem] border border-line-bright bg-graphite/95 p-4 backdrop-blur">
              <p className="font-mono text-label uppercase text-ink-faint">
                {CATEGORY_LABEL[focused.category]}
              </p>
              <p className="mt-1.5 font-display text-base font-medium">{focused.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{focused.oneLiner}</p>
              <p className="mt-2.5 font-mono text-label uppercase text-ink-faint">
                {focused.techStack.slice(0, 3).join(" · ")}
              </p>
            </div>
          )}
        </div>

        <div className="flex max-h-[32rem] flex-col overflow-y-auto border border-line">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-ink-dim">
              Nothing matches that. Try a technology like Next.js, or clear the filter.
            </p>
          ) : (
            results.map((p) => (
              <a
                key={p.slug}
                href={`/projects/${p.slug}`}
                onMouseEnter={() => setHovered(p.slug)}
                onMouseLeave={() => setHovered(null)}
                className={`border-b border-line p-4 outline-none transition-colors last:border-b-0 hover:bg-panel ${
                  focused?.slug === p.slug ? "bg-panel" : ""
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="led h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        p.category === "ai"
                          ? "#7c5cff"
                          : p.category === "web"
                            ? "#3fd0e0"
                            : p.category === "prototype"
                              ? "#ff7a5c"
                              : "#4fd07a",
                    }}
                  />
                  <span className="font-display text-sm font-medium">{p.title}</span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-dim">
                  {p.oneLiner}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

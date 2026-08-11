"use client";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { scrollSignal } from "@/lib/scroll-signal";

/*
  Ambient node network. The visual metaphor for the work itself: independent
  systems that find each other and hold a connection.

  Nodes drift on three parallax planes. An edge is drawn when two nodes on the
  same plane come within range, and its opacity falls off with distance, so the
  lattice continuously forms and dissolves rather than sitting static.

  Scroll velocity (from Lenis, via scrollSignal.warp) stretches nodes along the
  travel axis and thins the edges. Fast movement reads as motion blur through
  a field, and it settles the moment you stop.

  Canvas, one rAF loop, DPR-capped, paused when the tab is hidden.
*/

type Node = { x: number; y: number; vx: number; vy: number; plane: number };

const PLANES = [
  { count: 26, depth: 0.03, radius: 1.0, alpha: 0.3, link: 132 },
  { count: 17, depth: 0.07, radius: 1.4, alpha: 0.45, link: 156 },
  { count: 9, depth: 0.13, radius: 1.9, alpha: 0.62, link: 184 },
];

const DRIFT = 0.055;

export function AmbientField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      nodes = [];
      PLANES.forEach((plane, pi) => {
        for (let i = 0; i < plane.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * DRIFT,
            vy: Math.sin(angle) * DRIFT,
            plane: pi,
          });
        }
      });
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const warp = reduced ? 0 : scrollSignal.warp;
      const dir = scrollSignal.velocity >= 0 ? 1 : -1;
      // Streak length stays modest. This should read as motion, not as a
      // gaming hyperspace tunnel.
      const streak = warp * 34 * dir;

      PLANES.forEach((plane, pi) => {
        const planeNodes = nodes.filter((n) => n.plane === pi);
        const offset = scrollSignal.y * plane.depth;

        const posOf = (n: Node) => {
          const y = n.y - offset;
          return { x: n.x, y: ((y % height) + height) % height };
        };

        // Edges: connect near neighbours, fade with distance, thin out on warp.
        ctx.lineWidth = 1;
        for (let i = 0; i < planeNodes.length; i++) {
          const a = posOf(planeNodes[i]);
          for (let j = i + 1; j < planeNodes.length; j++) {
            const b = posOf(planeNodes[j]);
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.hypot(dx, dy);
            if (dist > plane.link) continue;

            const strength = (1 - dist / plane.link) * plane.alpha * 0.4 * (1 - warp * 0.8);
            if (strength <= 0.002) continue;

            ctx.strokeStyle = `rgba(150, 170, 205, ${strength})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Nodes: dots at rest, short capsules under scroll velocity.
        for (const n of planeNodes) {
          const p = posOf(n);
          const alpha = plane.alpha * (1 - warp * 0.25);

          if (warp > 0.03) {
            ctx.strokeStyle = `rgba(205, 220, 245, ${alpha})`;
            ctx.lineWidth = plane.radius * 1.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y - streak * (0.5 + plane.depth * 4));
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(205, 220, 245, ${alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, plane.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          if (!reduced) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < -20) n.x = width + 20;
            if (n.x > width + 20) n.x = -20;
          }
        }
      });

      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    // Fallback for when Lenis is not driving (reduced motion): keep parallax live.
    const onScroll = () => {
      scrollSignal.y = window.scrollY;
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}

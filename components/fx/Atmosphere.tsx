"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Screen atmosphere: a cursor-tracked light, fine scanlines, and a vignette.
  All non-interactive overlays. Kept very low contrast — these should register
  as depth, never as a filter sitting on top of the content.
*/
export function Atmosphere() {
  const reduced = usePrefersReducedMotion();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (reduced) return;
    // Pointer-based only: skips touch devices, where a cursor light is meaningless.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  return (
    <>
      {pos && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-[9] transition-opacity duration-500"
          style={{
            background: `radial-gradient(520px circle at ${pos.x}px ${pos.y}px, rgba(124,92,255,0.055), transparent 70%)`,
          }}
        />
      )}

      {/* Scanlines — 3px pitch, barely there */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Vignette — pulls focus to the centre column */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[59]"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </>
  );
}

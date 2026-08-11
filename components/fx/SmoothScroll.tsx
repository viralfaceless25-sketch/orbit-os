"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { pushScroll } from "@/lib/scroll-signal";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Momentum scrolling, and the source of the velocity signal that drives the
  ambient field's light-streak effect. Disabled entirely under reduced motion,
  since hijacking scroll is what that preference asks us not to do.
*/
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ({ scroll, velocity }: { scroll: number; velocity: number }) => {
      pushScroll(scroll, velocity);
    });

    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}

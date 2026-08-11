"use client";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}*#%$";

/*
  Decode-in effect: text resolves from noise, left to right. Used sparingly —
  once, on the piece of text that should feel like it is coming online.

  Accessibility: the real string stays in the DOM for screen readers; only the
  visual layer scrambles.
*/
export function ScrambleText({
  text,
  className,
  speed = 28,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(reduced ? text : "");
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }

    let raf = 0;
    let timeout: ReturnType<typeof setTimeout>;
    let tick = 0;
    frameRef.current = 0;

    const run = () => {
      tick++;
      // Two ticks per settled character keeps the noise readable, not frantic.
      const settled = Math.floor(tick / 2);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < settled) return char;
          if (i > settled + 8) return "";
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplay(next);

      if (settled <= text.length) {
        raf = requestAnimationFrame(() => {
          timeout = setTimeout(run, speed);
        });
      } else {
        setDisplay(text);
      }
    };

    timeout = setTimeout(run, delay);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [text, speed, delay, reduced]);

  return (
    <span className={className}>
      <span aria-hidden>{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

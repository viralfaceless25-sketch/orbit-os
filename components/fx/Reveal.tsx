"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Scroll-triggered reveal. Content lifts and resolves into place once, when it
  first enters view. The page assembles itself as you descend rather than
  animating on every pass.
*/
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Staggered list reveal. Rows resolve in sequence, like a readout populating. */
export function RevealStagger({
  children,
  className,
  step = 0.07,
}: {
  children: ReactNode[];
  className?: string;
  step?: number;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{ shown: { transition: { staggerChildren: step } } }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 14 },
            shown: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

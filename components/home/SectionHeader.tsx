"use client";
import { motion } from "framer-motion";
import { Reveal } from "@/components/fx/Reveal";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Shared section rhythm. The index is real ordering information (these sections
  are read top to bottom), so the numbering encodes sequence rather than
  decorating it.

  The underline draws itself as the header enters view — the section reads as
  being brought online rather than simply appearing.
*/
export function SectionHeader({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="mb-10 pb-5">
      <Reveal>
        <p className="font-mono text-label uppercase text-ink-faint">
          <span className="tabular-nums">{index}</span>
          <span className="mx-3 text-line-bright">/</span>
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-display-sm font-medium text-balance">{title}</h2>
      </Reveal>

      {reduced ? (
        <div className="mt-5 h-px w-full bg-line" />
      ) : (
        <motion.div
          className="mt-5 h-px w-full origin-left bg-line"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
        />
      )}
    </div>
  );
}

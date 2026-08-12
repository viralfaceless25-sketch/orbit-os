"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Reveal } from "@/components/fx/Reveal";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/*
  Asymmetric section layout. The header holds a narrow left column and stays
  pinned while its content scrolls past in the wider right column, so the page
  reads as a set of labelled panels rather than one uniform stack.

  Collapses to a single column below lg, where sticky headers would eat the
  viewport.
*/
export function Section({
  index,
  eyebrow,
  title,
  children,
  id,
}: {
  index: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  id?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <section
      id={id}
      className="grid scroll-mt-24 gap-6 border-t border-line py-14 sm:gap-10 sm:py-24 lg:grid-cols-[15rem_1fr] lg:gap-16"
    >
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Reveal>
          <p className="flex items-baseline gap-3 font-mono text-label uppercase text-ink-faint">
            <span className="tabular-nums text-ink-dim">{index}</span>
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-2xl font-medium leading-tight text-balance lg:text-3xl">
            {title}
          </h2>
        </Reveal>

        {reduced ? (
          <div className="mt-6 h-px w-12 bg-line-bright" />
        ) : (
          <motion.div
            className="mt-6 h-px w-12 origin-left bg-line-bright"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 }}
          />
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}

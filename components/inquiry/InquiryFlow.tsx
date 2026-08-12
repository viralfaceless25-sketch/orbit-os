"use client";
import { useState } from "react";
import {
  initialInquiryState,
  isStepComplete,
  nextStep,
  type InquiryState,
  type InquiryStepId,
} from "@/lib/inquiry-flow";

const INTERESTS = ["Website", "AI system", "Product prototype", "Technical support", "Something unusual"];
const STAGES = ["Just an idea", "Planning", "Already designed", "Existing product", "Something is broken"];
const TIMELINES = ["As soon as possible", "Within one month", "Within three months", "Flexible"];

const STEPS: { id: InquiryStepId; label: string }[] = [
  { id: "interest", label: "Interest" },
  { id: "stage", label: "Stage" },
  { id: "outcome", label: "Outcome" },
  { id: "timeline", label: "Timeline" },
  { id: "contact", label: "Contact" },
];

export function InquiryFlow({
  onSubmit,
  initialInterest,
}: {
  onSubmit: (state: InquiryState) => Promise<void>;
  initialInterest?: string;
}) {
  const [state, setState] = useState<InquiryState>(() =>
    initialInterest
      ? nextStep({ ...initialInquiryState, interest: initialInterest })
      : initialInquiryState
  );
  const canContinue = isStepComplete(state, state.step);
  const currentIndex = STEPS.findIndex((s) => s.id === state.step);

  const choice = (
    label: string,
    field: "interest" | "stage" | "timeline",
    selected: string | null
  ) => {
    const active = selected === label;
    return (
      <button
        key={label}
        onClick={() => setState({ ...state, [field]: label })}
        aria-pressed={active}
        className={`flex w-full items-center gap-3 border px-4 py-3 text-left text-sm outline-none transition-colors ${
          active
            ? "border-line-bright bg-panel text-ink"
            : "border-line text-ink-dim hover:border-line-bright hover:text-ink"
        }`}
      >
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full transition-colors ${
            active ? "bg-accent-oss" : "bg-line-bright"
          }`}
        />
        {label}
      </button>
    );
  };

  const fieldClass =
    "w-full border border-line bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-line-bright";

  return (
    <div className="max-w-xl py-10 sm:py-16">
      <p className="font-mono text-label uppercase text-ink-faint">Start a project</p>
      <h1 className="mt-4 font-display text-display-sm font-medium">
        Tell me what you are building.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-dim">
        Five short questions. No finished spec required. A rough idea is enough.
      </p>

      {state.step !== "review" && (
        <>
          <ol className="mt-8 flex gap-1.5 sm:mt-10" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex-1">
                <span
                  className={`block h-px transition-colors ${
                    i <= currentIndex ? "bg-ink" : "bg-line"
                  }`}
                />
                {/* Five tracked labels do not fit across a phone, so below sm
                    the bars carry position and a single line names the step. */}
                <span
                  className={`mt-2 hidden font-mono text-label uppercase sm:block ${
                    i === currentIndex ? "text-ink" : "text-ink-faint"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 font-mono text-label uppercase text-ink-dim sm:hidden">
            Step {currentIndex + 1}/{STEPS.length} · {STEPS[currentIndex]?.label}
          </p>
        </>
      )}

      <div className="mt-8 space-y-3 sm:mt-10">
        {state.step === "interest" && (
          <>
            <p className="mb-4 text-base">What are you interested in?</p>
            {INTERESTS.map((l) => choice(l, "interest", state.interest))}
          </>
        )}

        {state.step === "stage" && (
          <>
            <p className="mb-4 text-base">What stage are you at?</p>
            {STAGES.map((l) => choice(l, "stage", state.stage))}
          </>
        )}

        {state.step === "outcome" && (
          <>
            <label htmlFor="outcome" className="mb-4 block text-base">
              What would a successful outcome look like?
            </label>
            <textarea
              id="outcome"
              rows={4}
              placeholder="We can launch to our first customers by March."
              value={state.outcome}
              onChange={(e) => setState({ ...state, outcome: e.target.value })}
              className={fieldClass}
            />
          </>
        )}

        {state.step === "timeline" && (
          <>
            <p className="mb-4 text-base">Do you have a preferred timeline?</p>
            {TIMELINES.map((l) => choice(l, "timeline", state.timeline))}
          </>
        )}

        {state.step === "contact" && (
          <>
            <label htmlFor="contact" className="mb-4 block text-base">
              Tell me how to reach you.
            </label>
            <input
              id="contact"
              placeholder="you@company.com"
              value={state.contact}
              onChange={(e) => setState({ ...state, contact: e.target.value })}
              className={fieldClass}
            />
          </>
        )}

        {state.step === "review" && (
          <div className="border border-line p-6">
            <p className="font-mono text-label uppercase text-ink-faint">
              PROJECT REQUEST GENERATED
            </p>
            <dl className="mt-5 space-y-2">
              {[
                ["Interest", state.interest],
                ["Stage", state.stage],
                ["Outcome", state.outcome],
                ["Timeline", state.timeline],
                ["Contact", state.contact],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[6rem_1fr] gap-4">
                  <dt className="font-mono text-label uppercase text-ink-faint">{label}</dt>
                  <dd className="text-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              onClick={() => onSubmit(state)}
              className="mt-7 rounded-sm bg-ink px-5 py-2.5 font-mono text-label uppercase text-graphite transition-opacity hover:opacity-85"
            >
              Send Request
            </button>
          </div>
        )}
      </div>

      {state.step !== "review" && (
        <button
          disabled={!canContinue}
          onClick={() => setState(nextStep(state))}
          className="mt-8 rounded-sm border border-line px-5 py-2.5 font-mono text-label uppercase text-ink transition-colors enabled:hover:border-line-bright disabled:cursor-not-allowed disabled:text-ink-faint"
        >
          Continue
        </button>
      )}

      <p className="mt-10 border-t border-line pt-5 text-sm text-ink-dim">
        Prefer email?{" "}
        <a href="mailto:hello@orbitos.dev" className="text-ink underline underline-offset-4">
          hello@orbitos.dev
        </a>
      </p>
    </div>
  );
}

"use client";
import { useState } from "react";
import { initialInquiryState, isStepComplete, nextStep, type InquiryState } from "@/lib/inquiry-flow";

const INTERESTS = ["Website", "AI system", "Product prototype", "Technical support", "Something unusual"];
const STAGES = ["Just an idea", "Planning", "Already designed", "Existing product", "Something is broken"];
const TIMELINES = ["As soon as possible", "Within one month", "Within three months", "Flexible"];

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

  const choiceButton = (label: string, field: "interest" | "stage" | "timeline", selected: string | null) => (
    <button
      key={label}
      onClick={() => setState({ ...state, [field]: label })}
      className={`block w-full rounded border p-3 text-left ${
        selected === label ? "border-white" : "border-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-md space-y-4 py-12">
      {state.step === "interest" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">What are you interested in?</p>
          {INTERESTS.map((l) => choiceButton(l, "interest", state.interest))}
        </div>
      )}

      {state.step === "stage" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">What stage are you at?</p>
          {STAGES.map((l) => choiceButton(l, "stage", state.stage))}
        </div>
      )}

      {state.step === "outcome" && (
        <div className="space-y-2">
          <label htmlFor="outcome" className="font-mono text-sm">
            What would a successful outcome look like?
          </label>
          <textarea
            id="outcome"
            value={state.outcome}
            onChange={(e) => setState({ ...state, outcome: e.target.value })}
            className="w-full rounded border border-white/10 bg-transparent p-2"
          />
        </div>
      )}

      {state.step === "timeline" && (
        <div className="space-y-2">
          <p className="font-mono text-sm">Do you have a preferred timeline?</p>
          {TIMELINES.map((l) => choiceButton(l, "timeline", state.timeline))}
        </div>
      )}

      {state.step === "contact" && (
        <div className="space-y-2">
          <label htmlFor="contact" className="font-mono text-sm">
            Tell me how to reach you.
          </label>
          <input
            id="contact"
            value={state.contact}
            onChange={(e) => setState({ ...state, contact: e.target.value })}
            className="w-full rounded border border-white/10 bg-transparent p-2"
          />
        </div>
      )}

      {state.step === "review" && (
        <div className="space-y-3 font-mono text-sm">
          <p>PROJECT REQUEST GENERATED</p>
          <p className="text-[--color-text-dim]">Status: Ready to send</p>
          <button
            onClick={() => onSubmit(state)}
            className="rounded bg-white px-4 py-2 text-black"
          >
            Send Request
          </button>
        </div>
      )}

      {state.step !== "review" && (
        <button
          disabled={!canContinue}
          onClick={() => setState(nextStep(state))}
          className="rounded bg-white px-4 py-2 text-black disabled:opacity-40"
        >
          Continue
        </button>
      )}

      <p className="text-xs text-[--color-text-dim]">
        Prefer email? Write to{" "}
        <a href="mailto:hello@orbitos.dev" className="underline">
          hello@orbitos.dev
        </a>{" "}
        directly.
      </p>
    </div>
  );
}

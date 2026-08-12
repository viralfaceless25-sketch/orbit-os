import { describe, it, expect } from "vitest";
import { initialInquiryState, isStepComplete, nextStep, categoryToInterestLabel } from "./inquiry-flow";
import type { InquiryState } from "./inquiry-flow";

describe("inquiry flow state machine", () => {
  it("starts on the interest step, incomplete", () => {
    expect(initialInquiryState.step).toBe("interest");
    expect(isStepComplete(initialInquiryState, "interest")).toBe(false);
  });

  it("does not advance when the current step is incomplete", () => {
    const result = nextStep(initialInquiryState);
    expect(result.step).toBe("interest");
  });

  it("advances through each step once its field is filled", () => {
    let state: InquiryState = { ...initialInquiryState, interest: "Website" };
    state = nextStep(state);
    expect(state.step).toBe("stage");

    state = { ...state, stage: "Just an idea" };
    state = nextStep(state);
    expect(state.step).toBe("outcome");

    state = { ...state, outcome: "A working site by month end" };
    state = nextStep(state);
    expect(state.step).toBe("timeline");

    state = { ...state, timeline: "Within one month" };
    state = nextStep(state);
    expect(state.step).toBe("contact");

    state = { ...state, contact: "me@example.com" };
    state = nextStep(state);
    expect(state.step).toBe("review");
  });

  it("stops advancing at review", () => {
    const reviewState = { ...initialInquiryState, step: "review" as const };
    expect(nextStep(reviewState).step).toBe("review");
  });
});

describe("categoryToInterestLabel", () => {
  it("maps each project category to its matching interest label", () => {
    expect(categoryToInterestLabel("web")).toBe("Website");
    expect(categoryToInterestLabel("ai")).toBe("AI system");
    expect(categoryToInterestLabel("prototype")).toBe("Product prototype");
    expect(categoryToInterestLabel("open-source")).toBe("Something unusual");
  });
});

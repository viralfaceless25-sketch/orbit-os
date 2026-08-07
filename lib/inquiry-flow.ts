import type { ProjectCategory } from "@/data/projects";

export type InquiryStepId = "interest" | "stage" | "outcome" | "timeline" | "contact" | "review";

export interface InquiryState {
  interest: string | null;
  stage: string | null;
  outcome: string;
  timeline: string | null;
  contact: string;
  step: InquiryStepId;
}

export const initialInquiryState: InquiryState = {
  interest: null,
  stage: null,
  outcome: "",
  timeline: null,
  contact: "",
  step: "interest",
};

const STEP_ORDER: InquiryStepId[] = ["interest", "stage", "outcome", "timeline", "contact", "review"];

export function isStepComplete(state: InquiryState, step: InquiryStepId): boolean {
  switch (step) {
    case "interest":
      return state.interest !== null;
    case "stage":
      return state.stage !== null;
    case "outcome":
      return state.outcome.trim().length > 0;
    case "timeline":
      return state.timeline !== null;
    case "contact":
      return state.contact.trim().length > 0;
    case "review":
      return true;
  }
}

export function nextStep(state: InquiryState): InquiryState {
  if (!isStepComplete(state, state.step)) return state;
  const idx = STEP_ORDER.indexOf(state.step);
  const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
  return { ...state, step: next };
}

const CATEGORY_TO_INTEREST: Record<ProjectCategory, string> = {
  ai: "AI system",
  web: "Website",
  prototype: "Product prototype",
  "open-source": "Something unusual",
};

export function categoryToInterestLabel(category: ProjectCategory): string {
  return CATEGORY_TO_INTEREST[category];
}

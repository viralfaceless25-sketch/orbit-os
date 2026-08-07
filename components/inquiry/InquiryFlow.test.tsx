import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryFlow } from "./InquiryFlow";

describe("InquiryFlow", () => {
  it("walks through all five steps and calls onSubmit with the collected state", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<InquiryFlow onSubmit={onSubmit} />);

    await user.click(screen.getByText("Website"));
    await user.click(screen.getByText("Continue"));

    await user.click(screen.getByText("Just an idea"));
    await user.click(screen.getByText("Continue"));

    await user.type(screen.getByLabelText(/successful outcome/i), "A working site");
    await user.click(screen.getByText("Continue"));

    await user.click(screen.getByText("Within one month"));
    await user.click(screen.getByText("Continue"));

    await user.type(screen.getByLabelText(/reach you/i), "me@example.com");
    await user.click(screen.getByText("Continue"));

    expect(screen.getByText("PROJECT REQUEST GENERATED")).toBeInTheDocument();
    await user.click(screen.getByText("Send Request"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        interest: "Website",
        stage: "Just an idea",
        outcome: "A working site",
        timeline: "Within one month",
        contact: "me@example.com",
      })
    );
  });

  it("pre-fills interest and skips straight to the stage step when initialInterest is given", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InquiryFlow onSubmit={onSubmit} initialInterest="AI system" />);
    expect(screen.getByText("What stage are you at?")).toBeInTheDocument();
  });
});

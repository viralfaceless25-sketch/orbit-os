import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartAProjectPage from "./page";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("StartAProjectPage", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reference: "PRJ-2026-042" }),
    }) as unknown as typeof fetch;
  });

  it("submits the flow and shows the confirmation reference", async () => {
    const user = userEvent.setup();
    render(<StartAProjectPage />);

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
    await user.click(screen.getByText("Send Request"));

    expect(await screen.findByText(/PRJ-2026-042/)).toBeInTheDocument();
  });
});

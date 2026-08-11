import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BootSequence } from "./BootSequence";

describe("BootSequence", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  it("shows the boot lines then calls onDone", () => {
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);
    expect(screen.getByText("Initializing ORBIT OS")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onDone).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("calls onDone immediately for a returning visitor", () => {
    window.localStorage.setItem("orbit-os:boot-seen", "true");
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);
    expect(onDone).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

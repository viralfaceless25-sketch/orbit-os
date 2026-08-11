import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BootSequence } from "./BootSequence";

describe("BootSequence", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the first line immediately", () => {
    render(<BootSequence onDone={vi.fn()} />);
    expect(screen.getByText("Initializing ORBIT OS")).toBeInTheDocument();
  });

  it("runs on every load, not only the first visit", () => {
    // Previously a localStorage flag skipped this for returning visitors. The
    // sequence is now part of arriving at the site every time.
    const onDone = vi.fn();
    const first = render(<BootSequence onDone={onDone} />);
    expect(screen.getByText("System ready")).toBeInTheDocument();
    first.unmount();

    render(<BootSequence onDone={vi.fn()} />);
    expect(screen.getByText("System ready")).toBeInTheDocument();
  });

  it("holds the screen for longer than a second before finishing", () => {
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onDone).toHaveBeenCalled();
  });

  it("can be escaped with a key press so nobody is trapped", () => {
    const onDone = vi.fn();
    render(<BootSequence onDone={onDone} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(onDone).toHaveBeenCalled();
  });

  it("is skipped entirely when reduced motion is requested", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    const onDone = vi.fn();
    const { container } = render(<BootSequence onDone={onDone} />);

    expect(onDone).toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });
});

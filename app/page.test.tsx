import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

describe("Homepage", () => {
  beforeEach(() => {
    window.localStorage.setItem("orbit-os:boot-seen", "true");
  });

  it("renders all eight screens for a returning visitor (boot skipped)", () => {
    render(<Page />);
    expect(
      screen.getByText("A living system of websites, AI products, experiments, and ideas.")
    ).toBeInTheDocument();
    expect(screen.getByText("Keyush Patel", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("What are you trying to build?")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("RECENT OUTPUT")).toBeInTheDocument();
    expect(screen.getByText("Process")).toBeInTheDocument();
    expect(screen.getByText("HAVE AN IDEA?")).toBeInTheDocument();
  });
});

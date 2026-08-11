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
    expect(screen.getByText("What these systems solved")).toBeInTheDocument();
    expect(screen.getByText("What has shipped lately")).toBeInTheDocument();
    expect(screen.getByText("How a project runs")).toBeInTheDocument();
    expect(screen.getByText("Have an idea?")).toBeInTheDocument();
  });
});

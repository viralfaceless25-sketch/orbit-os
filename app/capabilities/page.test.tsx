import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CapabilitiesPage from "./page";

describe("CapabilitiesPage", () => {
  it("renders all four capability modules with their outputs", () => {
    render(<CapabilitiesPage />);
    expect(screen.getByText(/web development/i)).toBeInTheDocument();
    expect(screen.getByText(/ai systems/i)).toBeInTheDocument();
    expect(screen.getByText(/product prototyping/i)).toBeInTheDocument();
    expect(screen.getByText(/technical collaboration/i)).toBeInTheDocument();
    expect(screen.getAllByText("Available")).toHaveLength(4);
  });
});

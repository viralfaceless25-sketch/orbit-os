import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReadmePage from "./page";

describe("ReadmePage", () => {
  it("renders the about heading and the timeline", () => {
    render(<ReadmePage />);
    expect(screen.getByText("# Hello")).toBeInTheDocument();
    expect(screen.getByText(/Started building websites/)).toBeInTheDocument();
    expect(screen.getByText(/Now combining everything into one practice/)).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Screen2Intro } from "./Screen2Intro";
import { Screen3Profile } from "./Screen3Profile";
import { Screen4Selector } from "./Screen4Selector";
import { Screen5Constellation } from "./Screen5Constellation";
import { Screen6ProofOfWork } from "./Screen6ProofOfWork";
import { Screen7Process } from "./Screen7Process";
import { Screen8FinalCTA } from "./Screen8FinalCTA";

describe("Screen2Intro", () => {
  it("shows the tagline and both primary actions", () => {
    render(<Screen2Intro />);
    expect(
      screen.getByText("A living system of websites, AI products, experiments, and ideas.")
    ).toBeInTheDocument();
    expect(screen.getByText("Explore projects")).toBeInTheDocument();
    expect(screen.getByText("Start a Project")).toBeInTheDocument();
  });
});

describe("Screen3Profile", () => {
  it("shows the builder profile fields", () => {
    render(<Screen3Profile />);
    expect(screen.getByText("Keyush Patel", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Open for selected projects", { exact: false })).toBeInTheDocument();
  });
});

describe("Screen4Selector", () => {
  it("shows the four build-type modules", () => {
    render(<Screen4Selector />);
    expect(screen.getByText("A website")).toBeInTheDocument();
    expect(screen.getByText("An AI system")).toBeInTheDocument();
    expect(screen.getByText("A prototype")).toBeInTheDocument();
    expect(screen.getByText("Technical help")).toBeInTheDocument();
  });

  it("reveals matching projects when a module is selected", async () => {
    const user = userEvent.setup();
    render(<Screen4Selector />);
    await user.click(screen.getByText("An AI system"));
    expect(screen.getByText("AMS")).toBeInTheDocument();
    expect(screen.getByText("OSPA")).toBeInTheDocument();
  });
});

describe("Screen5Constellation", () => {
  it("renders all four featured project cards with a link to their detail page", () => {
    render(<Screen5Constellation />);
    expect(screen.getByRole("link", { name: /AMS/ })).toHaveAttribute("href", "/projects/ams");
    expect(screen.getByRole("link", { name: /OSPA/ })).toHaveAttribute("href", "/projects/ospa");
    expect(screen.getByRole("link", { name: /Jewel Stone/ })).toHaveAttribute(
      "href",
      "/projects/jewel-stone"
    );
    expect(screen.getByRole("link", { name: /DIMS/ })).toHaveAttribute("href", "/projects/dims");
  });
});

describe("Screen6ProofOfWork", () => {
  it("shows the recent output log", () => {
    render(<Screen6ProofOfWork />);
    expect(screen.getByText(/Built a multi-agent AI orchestrator/)).toBeInTheDocument();
  });
});

describe("Screen7Process", () => {
  it("shows all five process stages", () => {
    render(<Screen7Process />);
    for (const stage of ["Discover", "Prototype", "Build", "Launch", "Improve"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });
});

describe("Screen8FinalCTA", () => {
  it("shows the final inquiry prompt and CTA", () => {
    render(<Screen8FinalCTA />);
    expect(screen.getByText("Have an idea?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a Project" })).toHaveAttribute(
      "href",
      "/start-a-project"
    );
  });
});

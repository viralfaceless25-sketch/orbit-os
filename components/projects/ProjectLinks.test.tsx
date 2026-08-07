import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectLinks } from "./ProjectLinks";
import type { Project } from "@/data/projects";

const base: Project = {
  slug: "example",
  title: "Example",
  category: "web",
  tier: "featured",
  oneLiner: "An example.",
  status: "in-development",
  role: "Builder",
  problem: "p",
  contribution: "c",
  solution: "s",
  techStack: ["Next.js"],
  challenges: [],
  outcome: ["o"],
  screenshots: [],
};

describe("ProjectLinks", () => {
  it("shows only 'Discuss a Similar Project' when github/live are absent", () => {
    render(<ProjectLinks project={base} />);
    expect(screen.queryByText("View GitHub")).not.toBeInTheDocument();
    expect(screen.queryByText("Open Live Project")).not.toBeInTheDocument();
    expect(screen.getByText("Discuss a Similar Project")).toBeInTheDocument();
  });

  it("shows GitHub and live links when present", () => {
    render(
      <ProjectLinks
        project={{ ...base, githubUrl: "https://github.com/example/repo", liveUrl: "https://example.com" }}
      />
    );
    expect(screen.getByText("View GitHub")).toHaveAttribute(
      "href",
      "https://github.com/example/repo"
    );
    expect(screen.getByText("Open Live Project")).toHaveAttribute("href", "https://example.com");
  });
});

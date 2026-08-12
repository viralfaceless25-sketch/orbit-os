import { describe, it, expect } from "vitest";
import { answerFromRegistry } from "./ospa-fallback";
import { projects } from "@/data/projects";

describe("registry fallback", () => {
  it("always answers, whatever it is asked", () => {
    // The point of this path is that it cannot fail. An empty reply would put
    // the visitor back where the 503 left them.
    for (const q of ["", "???", "asdfghjkl", "what is the meaning of life"]) {
      expect(answerFromRegistry(q).length).toBeGreaterThan(20);
    }
  });

  it("describes a project asked for by name", () => {
    const answer = answerFromRegistry("tell me about Jewel Stone");
    expect(answer).toContain("Jewel Stone");
    expect(answer).toContain("/projects/jewel-stone");
  });

  it("finds work by a technology mentioned mid-sentence", () => {
    // The projects-page search substring-matches the whole query, so a
    // question has to be tokenised before it will match anything at all.
    const answer = answerFromRegistry("do you have any experience with Next.js?");
    expect(answer).toContain("/projects/");
  });

  it("points at the contact page when asked about hiring", () => {
    const answer = answerFromRegistry("are you available for hire?");
    expect(answer).toContain("/start-a-project");
  });

  it("says what OSPA is when asked", () => {
    const answer = answerFromRegistry("what are you?");
    expect(answer).toContain("/projects/ospa");
  });

  it("never invents a project path", () => {
    const valid = new Set(projects.map((p) => `/projects/${p.slug}`));
    const questions = [
      "tell me about AMS",
      "any AI systems?",
      "what about React work",
      "show me everything",
      "who are you",
      "can you help me build a store",
    ];

    for (const q of questions) {
      const paths = answerFromRegistry(q).match(/\/projects\/[a-z0-9-]+/g) ?? [];
      for (const path of paths) {
        expect(valid.has(path), `${path} (from "${q}") is not a real project`).toBe(true);
      }
    }
  });

  it("does not dump the whole registry for a common word", () => {
    // "work" and "project" appear in nearly every record, so matching on them
    // returns everything, which reads as the assistant ignoring the question.
    const answer = answerFromRegistry("what work have you done");
    const listed = (answer.match(/\/projects\/[a-z0-9-]+/g) ?? []).length;
    expect(listed).toBeLessThan(projects.length);
  });
});

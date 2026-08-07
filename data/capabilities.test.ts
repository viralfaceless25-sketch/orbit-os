import { describe, it, expect } from "vitest";
import { capabilities } from "./capabilities";

describe("capabilities registry", () => {
  it("has the four capability categories", () => {
    const names = capabilities.map((c) => c.name).sort();
    expect(names).toEqual(
      ["AI Systems", "Product Prototyping", "Technical Collaboration", "Web Development"].sort()
    );
  });

  it("every capability lists at least one 'useful for' and one output", () => {
    for (const c of capabilities) {
      expect(c.usefulFor.length).toBeGreaterThan(0);
      expect(c.outputs.length).toBeGreaterThan(0);
    }
  });
});

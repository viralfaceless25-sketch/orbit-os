import { describe, it, expect } from "vitest";
import { colors, fonts } from "./design-tokens";

describe("design-tokens", () => {
  it("exposes the base graphite palette", () => {
    expect(colors.base.graphite).toBe("#0b0d10");
    expect(colors.base.textOffWhite).toBe("#e9ecf1");
  });

  it("exposes all five category accents", () => {
    expect(Object.keys(colors.accent).sort()).toEqual(
      ["ai", "clientWork", "experiments", "openSource", "web"].sort()
    );
  });

  it("exposes the three font roles", () => {
    expect(Object.keys(fonts).sort()).toEqual(["display", "interface", "mono"].sort());
  });
});

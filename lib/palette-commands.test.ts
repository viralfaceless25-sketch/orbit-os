import { describe, it, expect } from "vitest";
import { paletteCommands, filterCommands } from "./palette-commands";

describe("filterCommands", () => {
  it("returns all commands for an empty query", () => {
    expect(filterCommands("")).toEqual(paletteCommands);
  });

  it("filters case-insensitively by label", () => {
    const results = filterCommands("github");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("github");
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterCommands("zzz-no-match")).toEqual([]);
  });
});

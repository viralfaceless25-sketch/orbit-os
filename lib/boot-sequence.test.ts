import { describe, it, expect } from "vitest";
import { hasSeenBoot, markBootSeen } from "./boot-sequence";

function fakeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
}

describe("boot sequence skip flag", () => {
  it("has not seen boot by default", () => {
    expect(hasSeenBoot(fakeStorage())).toBe(false);
  });

  it("has seen boot after marking it", () => {
    const storage = fakeStorage();
    markBootSeen(storage);
    expect(hasSeenBoot(storage)).toBe(true);
  });
});

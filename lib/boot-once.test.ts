import { describe, it, expect, beforeEach } from "vitest";
import { hasBooted, markBooted } from "./boot-once";

function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

/** Private browsing and blocked cookies make storage throw on access. */
function hostileStorage(): Storage {
  return {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  } as unknown as Storage;
}

describe("boot-once", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("reports not booted before anything happens", () => {
    expect(hasBooted(fakeStorage())).toBe(false);
  });

  it("reports booted after being marked", () => {
    const storage = fakeStorage();
    markBooted(storage);
    expect(hasBooted(storage)).toBe(true);
  });

  it("treats blocked storage as not booted rather than throwing", () => {
    // Private browsing must show the sequence, never crash the page.
    const storage = hostileStorage();
    expect(() => markBooted(storage)).not.toThrow();
    expect(hasBooted(storage)).toBe(false);
  });

  it("does not carry over between separate sessions", () => {
    const a = fakeStorage();
    markBooted(a);
    const b = fakeStorage();
    expect(hasBooted(b)).toBe(false);
  });
});

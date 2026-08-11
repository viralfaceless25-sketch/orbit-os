import "@testing-library/jest-dom/vitest";

/*
  jsdom does not implement several browser APIs the UI relies on. Provide inert
  defaults so component tests exercise real render paths instead of crashing.
  Tests that care about a specific behaviour can override these per-file.

  These are assigned through a loosely-typed alias: `IntersectionObserver` and
  friends are already declared on `Window`, so an `in` guard narrows `window`
  to `never` and the direct assignment fails to compile.
*/
const win = window as unknown as Record<string, unknown>;

// prefers-reduced-motion and other media queries — default to non-matching.
if (!win.matchMedia) {
  win.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Framer Motion's whileInView uses IntersectionObserver. The stub reports the
// element as immediately visible so revealed content is present in the DOM.
if (!win.IntersectionObserver) {
  win.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    private callback: (entries: unknown[], observer: unknown) => void;

    constructor(callback: (entries: unknown[], observer: unknown) => void) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback([{ isIntersecting: true, target }], this);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

// Lenis observes document size on init.
if (!win.ResizeObserver) {
  win.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

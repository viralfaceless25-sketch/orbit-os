import "@testing-library/jest-dom/vitest";

/*
  jsdom does not implement several browser APIs the UI relies on. Provide inert
  defaults so component tests exercise real render paths instead of crashing.
  Tests that care about a specific behaviour can override these per-file.
*/

// prefers-reduced-motion and other media queries — default to non-matching.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// Framer Motion's whileInView uses IntersectionObserver. The stub reports the
// element as immediately visible so revealed content is present in the DOM.
if (!("IntersectionObserver" in window)) {
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: true, target } as unknown as IntersectionObserverEntry],
        this
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver =
    StubIntersectionObserver as unknown as typeof IntersectionObserver;
}

// Lenis observes document size on init.
if (!("ResizeObserver" in window)) {
  class StubResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;
}

/*
  Tracks whether the boot sequence has already played for this visit.

  Deliberately sessionStorage rather than localStorage: a new visit or a new tab
  should still get the sequence, but refreshing or moving around within a single
  visit should not replay it. localStorage would show it once ever and never
  again, which loses it for returning visitors entirely.

  Storage is wrapped because it throws in private-browsing modes and when
  cookies are blocked. A failure there must not take the page down, so the
  fallback is simply to play the sequence.
*/
const KEY = "orbit-os:booted";

export function hasBooted(storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markBooted(storage: Storage | undefined = safeStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(KEY, "1");
  } catch {
    // Nothing to do: the sequence simply plays again next time.
  }
}

function safeStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

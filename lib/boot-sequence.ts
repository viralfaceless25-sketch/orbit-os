const BOOT_SEEN_KEY = "orbit-os:boot-seen";

export function hasSeenBoot(storage: Pick<Storage, "getItem">): boolean {
  return storage.getItem(BOOT_SEEN_KEY) === "true";
}

export function markBootSeen(storage: Pick<Storage, "setItem">): void {
  storage.setItem(BOOT_SEEN_KEY, "true");
}

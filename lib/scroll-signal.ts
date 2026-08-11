/*
  A tiny shared signal between the smooth-scroll driver and the ambient canvas.

  Deliberately a plain module-level object rather than React state: the canvas
  reads it every animation frame, and routing that through React would trigger
  a re-render per frame. Nothing here belongs in the component tree.
*/
export const scrollSignal = {
  /** Current scroll offset in px. */
  y: 0,
  /** Instantaneous scroll velocity — signed, px per frame-ish. */
  velocity: 0,
  /** Smoothed absolute velocity in 0..1, used to drive the streak effect. */
  warp: 0,
};

/** Highest velocity we treat as "full warp". Above this the effect is clamped. */
const WARP_CEILING = 55;

export function pushScroll(y: number, velocity: number) {
  scrollSignal.y = y;
  scrollSignal.velocity = velocity;

  const target = Math.min(Math.abs(velocity) / WARP_CEILING, 1);
  // Ease toward the target so streaks build and decay smoothly instead of
  // snapping on every jitter of the wheel.
  const smoothing = target > scrollSignal.warp ? 0.16 : 0.07;
  scrollSignal.warp += (target - scrollSignal.warp) * smoothing;

  if (scrollSignal.warp < 0.001) scrollSignal.warp = 0;
}

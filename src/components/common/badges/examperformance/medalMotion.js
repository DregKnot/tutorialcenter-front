export const TURN_SECONDS = 5;

// Use elapsed time, not capped frame deltas: dropped frames must not slow the turn.
export function rotationAt(seconds) {
  return (seconds % TURN_SECONDS) / TURN_SECONDS * Math.PI * 2;
}

export function choosePixelRatio(current, averageFrameMs) {
  return averageFrameMs > 26 ? Math.max(0.75, current - 0.25) : current;
}

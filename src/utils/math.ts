/** Constrain `value` to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Half-open integer range [start, end) — end exclusive. */
export function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i < end; i += 1) out.push(i);
  return out;
}

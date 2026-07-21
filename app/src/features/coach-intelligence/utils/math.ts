/** Round to two decimal places (matches analytics / records helpers). */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Clamp a number into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Whole UTC calendar days between two ISO timestamps (or Date). */
export function daysBetween(earlierIso: string, later: Date): number {
  const earlier = Date.parse(earlierIso);
  if (!Number.isFinite(earlier)) {
    return 0;
  }
  const ms = later.getTime() - earlier;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

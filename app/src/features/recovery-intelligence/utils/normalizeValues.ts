/**
 * Clamp a finite number into [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * Round to a fixed number of decimal places (deterministic).
 */
export function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Normalize optional numeric input; treat NaN/Infinity as 0.
 */
export function normalizeNonNegative(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0;
  }
  return value < 0 ? 0 : value;
}

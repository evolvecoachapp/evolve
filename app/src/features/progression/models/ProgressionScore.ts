/**
 * Aggregate quality / completeness score for a progression plan.
 * Axes correspond to independent progression strategies.
 */
export interface ProgressionScore {
  readonly total: number;
  readonly linear: number;
  readonly volume: number;
  readonly intensity: number;
  readonly frequency: number;
  readonly rotation: number;
}

export function createEmptyProgressionScore(): ProgressionScore {
  return Object.freeze({
    total: 0,
    linear: 0,
    volume: 0,
    intensity: 0,
    frequency: 0,
    rotation: 0,
  });
}

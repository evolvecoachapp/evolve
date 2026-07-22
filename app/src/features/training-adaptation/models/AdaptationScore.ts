/**
 * Aggregate quality / readiness score for a training adaptation result.
 * Axes correspond to assessments and adaptation strategies.
 */
export interface AdaptationScore {
  readonly total: number;
  readonly readiness: number;
  readonly recovery: number;
  readonly fatigue: number;
  readonly constraints: number;
  readonly adaptation: number;
}

export function createEmptyAdaptationScore(): AdaptationScore {
  return Object.freeze({
    total: 0,
    readiness: 0,
    recovery: 0,
    fatigue: 0,
    constraints: 0,
    adaptation: 0,
  });
}

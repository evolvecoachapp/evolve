/**
 * Deterministic workout-frequency load from Athlete History.
 */
export interface FrequencyLoad {
  readonly windowDays: number;
  readonly workoutsInWindow: number;
  readonly performanceEntriesInWindow: number;
  /** 0–100 frequency component used by fatigue aggregation. */
  readonly frequencyScore: number;
}

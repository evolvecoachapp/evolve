/**
 * Movement-level rollup (alias of exercise performance for future movement taxonomy).
 * Single-session only — no cross-session aggregation.
 */
export interface MovementPerformance {
  readonly movementKey: string;
  readonly exerciseRuntimeId: string;
  readonly exerciseId: string | null;
  readonly exerciseName: string | null;
  readonly completedSets: number;
  readonly totalRepetitions: number;
  readonly tonnage: number;
}

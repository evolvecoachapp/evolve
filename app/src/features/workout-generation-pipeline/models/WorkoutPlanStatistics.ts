/**
 * Immutable plan statistics (distinct from workout-adaptation statistics).
 */
export interface WorkoutPlanStatistics {
  readonly weekCount: number;
  readonly dayCount: number;
  readonly blockCount: number;
  readonly exerciseCount: number;
  readonly targetCount: number;
  readonly recommendationCount: number;
  readonly decisionCount: number;
  readonly warningCount: number;
}

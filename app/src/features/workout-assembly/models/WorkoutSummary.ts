/**
 * Aggregate summary of an assembled WorkoutSession.
 * Estimates only — no analytics, no logging.
 */
export interface WorkoutSummary {
  readonly exerciseCount: number;
  readonly blockCount: number;
  readonly totalSets: number;
  readonly totalRepsMin: number;
  readonly totalRepsMax: number;
  readonly estimatedDurationSeconds: number;
  readonly estimatedWorkload: number;
  readonly appliedRecommendationCount: number;
  readonly readinessScore: number;
}

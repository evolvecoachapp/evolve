/**
 * Immutable numeric metrics for a WorkoutPlan.
 */
export interface WorkoutMetrics {
  readonly estimatedDurationSeconds: number;
  readonly estimatedWorkload: number;
  readonly exerciseCount: number;
  readonly setCount: number;
  readonly volumeScore: number;
  readonly intensityScore: number;
  readonly readinessScore: number;
}

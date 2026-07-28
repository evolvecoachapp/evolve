/**
 * Immutable presentation progress model for the operational workout UI.
 * Distinct from the Sprint 18.0 engine `WorkoutProgress` domain model.
 */
export interface WorkoutProgress {
  readonly totalExercises: number;
  readonly completedExercises: number;
  readonly remainingExercises: number;
  readonly totalSets: number;
  readonly completedSets: number;
  readonly remainingSets: number;
  readonly completionPercent: number;
  readonly estimatedRemainingMinutes: number;
  readonly durationSeconds: number;
}

export function createWorkoutProgress(input: WorkoutProgress): WorkoutProgress {
  return Object.freeze({ ...input });
}

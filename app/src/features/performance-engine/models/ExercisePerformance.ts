/**
 * Per-exercise single-session performance derived from domain events + result.
 */
export interface ExercisePerformance {
  readonly exerciseRuntimeId: string;
  readonly exerciseId: string | null;
  readonly exerciseName: string | null;
  readonly order: number | null;
  readonly completedSets: number;
  readonly skipped: boolean;
  readonly completed: boolean;
  readonly totalRepetitions: number;
  readonly tonnage: number;
  readonly averageWeight: number | null;
  readonly averageRpe: number | null;
  readonly averageRir: number | null;
}

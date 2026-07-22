import type { ExerciseState } from "./ExerciseState";
import type { SetRuntime } from "./SetRuntime";

/**
 * Mutable runtime state for one assembled WorkoutExercise.
 */
export interface ExerciseRuntime {
  readonly id: string;
  readonly workoutExerciseId: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly order: number;
  readonly state: ExerciseState;
  readonly sets: readonly SetRuntime[];
  readonly currentSetIndex: number | null;
  readonly completedSetCount: number;
  readonly skippedSetCount: number;
  readonly totalSetCount: number;
  /** 0–100 within this exercise. */
  readonly progressPercent: number;
  readonly skipped: boolean;
  readonly completed: boolean;
}

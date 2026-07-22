import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return (numerator / denominator) * 100;
}

/**
 * Pure completion calculator — ratios from WorkoutResult progress.
 */
export class CompletionCalculator {
  calculate(result: WorkoutResult): {
    readonly totalExercises: number;
    readonly completedExercises: number;
    readonly skippedExercises: number;
    readonly totalSets: number;
    readonly completedSets: number;
    readonly skippedSets: number;
    readonly exerciseCompletionPercent: number;
    readonly setCompletionPercent: number;
    readonly workoutCompletionPercent: number;
  } {
    const { progress } = result;

    return Object.freeze({
      totalExercises: progress.totalExercises,
      completedExercises: progress.completedExercises,
      skippedExercises: progress.skippedExercises,
      totalSets: progress.totalSets,
      completedSets: progress.completedSets,
      skippedSets: progress.skippedSets,
      exerciseCompletionPercent: percent(
        progress.completedExercises,
        progress.totalExercises,
      ),
      setCompletionPercent: percent(
        progress.completedSets,
        progress.totalSets,
      ),
      workoutCompletionPercent: progress.completionPercent,
    });
  }
}

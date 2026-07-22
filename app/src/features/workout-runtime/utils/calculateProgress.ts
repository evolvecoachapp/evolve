import type { ExerciseRuntime } from "../models/ExerciseRuntime";
import type { WorkoutProgress } from "../models/WorkoutProgress";
import type { WorkoutRuntimeMetrics } from "../models/WorkoutRuntimeMetrics";

/**
 * Calculate aggregate workout progress from exercise runtimes.
 */
export function calculateProgress(
  exercises: readonly ExerciseRuntime[],
): WorkoutProgress {
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(
    (exercise) => exercise.state === "Completed",
  ).length;
  const skippedExercises = exercises.filter(
    (exercise) => exercise.state === "Skipped",
  ).length;
  const remainingExercises = Math.max(
    0,
    totalExercises - completedExercises - skippedExercises,
  );

  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.totalSetCount,
    0,
  );
  const completedSets = exercises.reduce(
    (sum, exercise) => sum + exercise.completedSetCount,
    0,
  );
  const skippedSets = exercises.reduce(
    (sum, exercise) => sum + exercise.skippedSetCount,
    0,
  );
  const remainingSets = Math.max(0, totalSets - completedSets - skippedSets);

  const finishedUnits = completedSets + skippedSets;
  const completionPercent =
    totalSets === 0
      ? 100
      : Math.min(100, Math.round((finishedUnits / totalSets) * 100));

  return Object.freeze({
    totalExercises,
    completedExercises,
    skippedExercises,
    remainingExercises,
    totalSets,
    completedSets,
    skippedSets,
    remainingSets,
    completionPercent,
  });
}

export function buildMetrics(input: {
  readonly exercises: readonly ExerciseRuntime[];
  readonly eventCount: number;
  readonly pauseCount: number;
}): WorkoutRuntimeMetrics {
  const progress = calculateProgress(input.exercises);
  return Object.freeze({
    totalExercises: progress.totalExercises,
    totalSets: progress.totalSets,
    completedSets: progress.completedSets,
    skippedSets: progress.skippedSets,
    completedExercises: progress.completedExercises,
    skippedExercises: progress.skippedExercises,
    eventCount: input.eventCount,
    pauseCount: input.pauseCount,
  });
}

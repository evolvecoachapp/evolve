import type { WorkoutSessionSummary } from "../../workout/types/workoutSessionSummary";
import { WorkoutExerciseStatuses } from "../models/experience/WorkoutExercise";
import type { WorkoutRuntime } from "../models/experience/WorkoutRuntime";
import { WorkoutSetStatuses } from "../models/experience/WorkoutSet";

export interface MapWorkoutRuntimeToSessionSummaryOptions {
  readonly runtime: WorkoutRuntime;
  readonly programName?: string | null;
  readonly completedAt: string;
}

/** Maps a completed experience WorkoutRuntime into a WorkoutSessionSummary. */
export function mapWorkoutRuntimeToSessionSummary({
  runtime,
  programName = null,
  completedAt,
}: MapWorkoutRuntimeToSessionSummaryOptions): WorkoutSessionSummary {
  let estimatedVolumeKg = 0;
  let workingRepsSum = 0;
  let workingRepsCount = 0;
  let skippedSets = 0;

  const exercises = Object.freeze(
    runtime.exercises.map((exercise) => {
      const completedSets = Object.freeze(
        exercise.sets
          .filter((set) => set.completed)
          .map((set) => {
            const weightKg = set.weight ?? 0;
            const reps = set.repetitions ?? 0;
            estimatedVolumeKg += weightKg * reps;
            workingRepsSum += reps;
            workingRepsCount += 1;
            return Object.freeze({
              id: set.id,
              setNumber: set.index + 1,
              weightKg,
              reps,
            });
          }),
      );

      skippedSets += exercise.sets.filter(
        (set) => set.status === WorkoutSetStatuses.SKIPPED,
      ).length;

      return Object.freeze({
        id: exercise.id,
        name: exercise.name,
        order: exercise.order,
        sets: completedSets,
      });
    }),
  );

  const completedExercises = runtime.exercises.filter(
    (exercise) => exercise.status === WorkoutExerciseStatuses.COMPLETED,
  ).length;

  const totalSets = runtime.progress.totalSets;
  const completedSets = runtime.progress.completedSets;
  const accountedSets = completedSets + skippedSets;
  const completionPercent =
    totalSets === 0 ? 0 : Math.round((accountedSets / totalSets) * 100);

  return Object.freeze({
    sessionId: runtime.id,
    title: runtime.title,
    programName,
    durationSeconds: runtime.progress.durationSeconds,
    completedExercises,
    totalExercises: runtime.progress.totalExercises,
    completedSets,
    skippedSets,
    totalSets,
    completionPercent,
    estimatedVolumeKg: Math.round(estimatedVolumeKg),
    averageCompletedReps:
      workingRepsCount === 0
        ? null
        : Math.round((workingRepsSum / workingRepsCount) * 10) / 10,
    completedAt,
    exercises,
  });
}

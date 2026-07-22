import type { ExercisePerformance } from "../models/ExercisePerformance";
import type { MovementPerformance } from "../models/MovementPerformance";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { VolumeMetrics } from "../models/VolumeMetrics";
import type {
  CompletedSetSample,
  ExerciseLifecycleSample,
} from "../calculators/VolumeCalculator";
import { VolumeCalculator } from "../calculators/VolumeCalculator";
import { IntensityCalculator } from "../calculators/IntensityCalculator";

/**
 * Aggregate set samples into per-exercise performance rows.
 */
export function aggregateExercisePerformance(
  sets: readonly CompletedSetSample[],
  exercises: readonly ExerciseLifecycleSample[],
  completedExerciseIds: readonly string[],
  skippedExerciseIds: readonly string[],
): readonly ExercisePerformance[] {
  const volumeCalculator = new VolumeCalculator();
  const intensityCalculator = new IntensityCalculator();

  const setsByExercise = new Map<string, CompletedSetSample[]>();
  for (const set of sets) {
    const list = setsByExercise.get(set.exerciseRuntimeId) ?? [];
    list.push(set);
    setsByExercise.set(set.exerciseRuntimeId, list);
  }

  const lifecycleById = new Map(
    exercises.map((item) => [item.exerciseRuntimeId, item]),
  );

  const allIds = new Set<string>([
    ...setsByExercise.keys(),
    ...lifecycleById.keys(),
  ]);

  const rows: ExercisePerformance[] = [];

  for (const exerciseRuntimeId of allIds) {
    const lifecycle = lifecycleById.get(exerciseRuntimeId);
    const exerciseSets = setsByExercise.get(exerciseRuntimeId) ?? [];
    const volume = volumeCalculator.calculate(exerciseSets);
    const intensity = intensityCalculator.calculate(exerciseSets);

    const exerciseId = lifecycle?.exerciseId ?? null;
    const completed =
      lifecycle?.completed === true ||
      completedExerciseIds.includes(exerciseRuntimeId) ||
      (lifecycle === undefined && exerciseSets.length > 0);
    const skipped =
      lifecycle?.skipped === true ||
      skippedExerciseIds.includes(exerciseRuntimeId);

    rows.push(
      Object.freeze({
        exerciseRuntimeId,
        exerciseId,
        exerciseName: lifecycle?.exerciseName ?? null,
        order: lifecycle?.order ?? null,
        completedSets: volume.totalCompletedSets,
        skipped,
        completed,
        totalRepetitions: volume.totalCompletedRepetitions,
        tonnage: volume.tonnage,
        averageWeight: intensity.averageWeight,
        averageRpe: intensity.averageRpe,
        averageRir: intensity.averageRir,
      }),
    );
  }

  return Object.freeze(
    rows.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    }),
  );
}

/**
 * Build movement rollups from exercise performance (1:1 in this sprint).
 */
export function aggregateMovements(
  exercises: readonly ExercisePerformance[],
): readonly MovementPerformance[] {
  return Object.freeze(
    exercises.map((exercise) =>
      Object.freeze({
        movementKey:
          exercise.exerciseId ??
          exercise.exerciseName ??
          exercise.exerciseRuntimeId,
        exerciseRuntimeId: exercise.exerciseRuntimeId,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        completedSets: exercise.completedSets,
        totalRepetitions: exercise.totalRepetitions,
        tonnage: exercise.tonnage,
      }),
    ),
  );
}

/**
 * Aggregate top-level volume from metrics (identity helper for API symmetry).
 */
export function aggregateVolume(
  volume: VolumeMetrics,
): VolumeMetrics {
  return Object.freeze({ ...volume });
}

/**
 * Shallow aggregate of metrics parts into a frozen PerformanceMetrics.
 */
export function aggregateMetrics(
  metrics: PerformanceMetrics,
): PerformanceMetrics {
  return Object.freeze({
    volume: Object.freeze({ ...metrics.volume }),
    intensity: Object.freeze({ ...metrics.intensity }),
    density: Object.freeze({ ...metrics.density }),
    completion: Object.freeze({ ...metrics.completion }),
  });
}

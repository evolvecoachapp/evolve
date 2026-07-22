import type { WorkoutTrend } from "../../analytics/models/WorkoutTrend";
import type {
  CompletedWorkout,
  CompletedWorkoutExercise,
  CompletedWorkoutSet,
} from "../../workout/models/CompletedWorkout";
import type { ExerciseRecord } from "../../records/models/ExerciseRecord";
import type { WorkoutRecord } from "../../records/models/WorkoutRecord";

export function createSet(
  overrides: Partial<CompletedWorkoutSet> &
    Pick<CompletedWorkoutSet, "id" | "weightKg" | "reps">,
): CompletedWorkoutSet {
  return Object.freeze({
    setNumber: 1,
    ...overrides,
  });
}

export function createExercise(
  overrides: Partial<CompletedWorkoutExercise> &
    Pick<CompletedWorkoutExercise, "id" | "name">,
): CompletedWorkoutExercise {
  const sets = Object.freeze(overrides.sets ?? []);
  return Object.freeze({
    order: 0,
    ...overrides,
    sets,
  });
}

export function createWorkout(
  overrides: Partial<CompletedWorkout> &
    Pick<CompletedWorkout, "id" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    title: "Upper A",
    programName: null,
    durationSeconds: 2700,
    completedExercises: 2,
    totalExercises: 3,
    completedSets: 8,
    skippedSets: 0,
    totalSets: 8,
    completionPercent: 100,
    estimatedVolumeKg: 1200,
    averageCompletedReps: 10,
    exercises: Object.freeze([]),
    ...overrides,
  });
}

export function createTrend(
  metric: WorkoutTrend["metric"],
  values: readonly number[],
  startMonday = "2026-05-25",
): WorkoutTrend {
  const start = Date.parse(`${startMonday}T00:00:00.000Z`);
  return Object.freeze({
    metric,
    points: Object.freeze(
      values.map((value, index) =>
        Object.freeze({
          periodStart: new Date(start + index * 7 * 86_400_000)
            .toISOString()
            .slice(0, 10),
          value,
        }),
      ),
    ),
  });
}

export function createWorkoutRecord(
  overrides: Partial<WorkoutRecord> = {},
): WorkoutRecord {
  return Object.freeze({
    bestWeightKg: 120,
    bestEstimatedOneRMKg: 132,
    bestSessionVolumeKg: 1100,
    bestSingleSetVolumeKg: 480,
    bestReps: 8,
    lastRecordAt: "2026-07-20T12:00:00.000Z",
    ...overrides,
  });
}

export function createExerciseRecord(
  overrides: Partial<ExerciseRecord> &
    Pick<ExerciseRecord, "exerciseId" | "exerciseName">,
): ExerciseRecord {
  return Object.freeze({
    bestWeightKg: 100,
    bestEstimatedOneRM: null,
    bestSingleSetVolumeKg: 400,
    bestReps: 5,
    lastRecordAt: "2026-06-01T12:00:00.000Z",
    ...overrides,
  });
}

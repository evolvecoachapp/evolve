import type {
  CompletedWorkout,
  CompletedWorkoutExercise,
  CompletedWorkoutSet,
} from "../../workout/models/CompletedWorkout";

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

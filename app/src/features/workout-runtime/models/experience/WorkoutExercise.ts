import type { WorkoutSet } from "./WorkoutSet";

export const WorkoutExerciseStatuses = {
  PENDING: "pending",
  CURRENT: "current",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;

export type WorkoutExerciseStatus =
  (typeof WorkoutExerciseStatuses)[keyof typeof WorkoutExerciseStatuses];

/** Immutable presentation model for one workout exercise. */
export interface WorkoutExercise {
  readonly id: string;
  readonly name: string;
  readonly order: number;
  readonly muscleGroup: string;
  readonly equipment: string;
  readonly sets: readonly WorkoutSet[];
  readonly currentSetIndex: number;
  readonly status: WorkoutExerciseStatus;
  readonly completedSetCount: number;
  readonly totalSetCount: number;
  readonly progressPercent: number;
  readonly detailDestination: string;
}

export function createWorkoutExercise(input: WorkoutExercise): WorkoutExercise {
  return Object.freeze({
    ...input,
    sets: Object.freeze([...input.sets]),
  });
}

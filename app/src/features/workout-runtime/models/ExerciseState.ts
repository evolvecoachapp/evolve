/**
 * Per-exercise lifecycle within a workout runtime.
 */
export type ExerciseState =
  | "Pending"
  | "Active"
  | "Completed"
  | "Skipped";

export const EXERCISE_STATES = Object.freeze([
  "Pending",
  "Active",
  "Completed",
  "Skipped",
] as const satisfies readonly ExerciseState[]);

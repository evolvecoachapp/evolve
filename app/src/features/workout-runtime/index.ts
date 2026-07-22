/**
 * Workout Runtime Foundation (Sprint 18.0).
 *
 * Runtime state of a generated WorkoutSession while it is actively performed.
 *
 * WorkoutSession → WorkoutRuntime → ExerciseRuntime → SetRuntime →
 * SessionState → WorkoutResult
 *
 * Consumes an immutable WorkoutSession. Does not modify Program Generation.
 * No UI. No persistence. No networking. No timers. No analytics. No history.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./runtime";
export * from "./services";
export * from "./integration";
export {
  startWorkout,
  pauseWorkout,
  resumeWorkout,
  completeWorkout,
  skipExercise,
  completeSet,
} from "./application";
export type { ActiveWorkout } from "./application";

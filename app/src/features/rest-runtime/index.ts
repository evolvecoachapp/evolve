/**
 * Rest Runtime Foundation (Sprint 18.1).
 *
 * Deterministic rest-period domain for live workouts.
 *
 * WorkoutRuntime → RestRuntime → RestSession → RestResult
 *
 * Elapsed time is injected externally. No platform timers.
 * No UI. No persistence. No networking. No AI. No analytics.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./runtime";
export * from "./services";
export * from "./integration";
export {
  startRest,
  pauseRest,
  resumeRest,
  cancelRest,
  completeRest,
  updateElapsedTime,
} from "./application";
export type { ActiveRest } from "./application";

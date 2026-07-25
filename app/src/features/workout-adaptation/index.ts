/**
 * Workout Adaptation Engine
 *
 * Sprint 24.1 — Workout Adaptation Engine Foundation.
 *
 * Workout Blueprint + Workout Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   ↓
 * Workout Adaptation Engine
 *   ↓
 * Updated Workout Blueprint → Workout Runtime
 *
 * Adapts an existing workout blueprint according to adaptation decisions.
 * Does NOT generate workouts from scratch. Does NOT change athlete goals.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No business calculations that invent prescriptions.
 *
 * Public surface: models + application API + WorkoutAdaptationEngineService.
 * Internal layers (evaluation / planning / adapters / policies / etc.) are not exported.
 */

export * from "./models";
export {
  adaptWorkout,
  compareWorkout,
  describeWorkoutAdaptation,
  createWorkoutSnapshot,
  validateWorkoutAdaptation,
} from "./application";
export {
  WorkoutAdaptationEngineService,
  createWorkoutAdaptationEngineService,
} from "./services";

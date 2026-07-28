/**
 * Workout Runtime
 *
 * Sprint 18.0 — Foundation engine (live session execution state).
 * Sprint 31.2 — Product Workout Runtime Experience (ViewModel → Application → providers).
 *
 * Engine: WorkoutSession → WorkoutRuntime → ExerciseRuntime → SetRuntime → WorkoutResult
 * Product: React UI → WorkoutRuntimeViewModel → Application → ExperienceService → Mock/Backend/Local
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
  loadWorkoutRuntime,
  refreshWorkoutRuntime,
  completeWorkoutSet,
  updateWorkoutSet,
  navigateWorkout,
  finishWorkout,
  startRestTimer,
  pauseRestTimer,
  resumeRestTimer,
  tickRestTimer,
  clearRestTimer,
} from "./application";
export type { ActiveWorkout } from "./application";

export * from "./hooks";
export * from "./viewmodels";
export * from "./screens";
export * from "./components";
export * from "./mappers";
export * as WorkoutRuntimeExperience from "./models/experience";
export {
  workoutRuntimeExperienceService,
  createWorkoutRuntimeExperienceService,
  resolveWorkoutRuntimeProviderId,
  mockWorkoutRuntimeService,
  backendWorkoutRuntimeService,
  localWorkoutRuntimeService,
  WorkoutRuntimeExperienceError,
} from "./services/experience";
export type {
  WorkoutRuntimeExperienceService,
  WorkoutRuntimeProviderId,
} from "./services/experience";

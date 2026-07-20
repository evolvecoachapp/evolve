/**
 * Application layer for the `training` feature.
 *
 * Thin orchestration only: maps athlete inputs onto Training Engine
 * contracts and returns engine output. No planning algorithms live here.
 * Presentation adapters project engine output into UI-ready preview models.
 * Session adapters project a preview day into an executable workout session.
 * UI adapters (`WorkoutPreviewProvider`) keep React consumers thin.
 */
export type { AthleteProfile } from "./AthleteProfile";
export { TrainingGenerationService } from "./TrainingGenerationService";
export {
  WorkoutPreviewProvider,
  createWorkoutPreviewProvider,
} from "./WorkoutPreviewProvider";
export {
  WorkoutPreviewBuilder,
  createExerciseDisplayLookup,
} from "./presentation";
export type {
  ExerciseDisplayLookup,
  WorkoutPreviewDay,
  WorkoutPreviewExercise,
  WorkoutPreviewIntensity,
  WorkoutPreviewProgressionSummary,
  WorkoutPreviewReps,
  WorkoutPreviewSet,
  WorkoutPreviewWeeklySchedule,
  WorkoutProgramPreview,
} from "./presentation";
export { WorkoutSessionBuilder } from "./session";
export type {
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionIntensity,
  WorkoutSessionProgressionReference,
  WorkoutSessionReps,
  WorkoutSessionSet,
  WorkoutSessionStatus,
} from "./session";

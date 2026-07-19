/**
 * Application layer for the `training` feature.
 *
 * Thin orchestration only: maps athlete inputs onto Training Engine
 * contracts and returns engine output. No planning algorithms live here.
 * Presentation adapters project engine output into UI-ready preview models.
 */
export type { AthleteProfile } from "./AthleteProfile";
export { TrainingGenerationService } from "./TrainingGenerationService";
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

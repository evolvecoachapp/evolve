/**
 * Presentation adapters for the training application layer.
 *
 * Map engine/domain outputs into immutable UI-ready models. No React,
 * planning, persistence, AI, or networking lives here.
 */
export {
  WorkoutPreviewBuilder,
  createExerciseDisplayLookup,
} from "./WorkoutPreviewBuilder";
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
} from "./WorkoutPreviewBuilder";

/**
 * Session adapters for the training application layer.
 *
 * Map UI-ready program previews into immutable executable workout sessions.
 * No React, planning, persistence, AI, or networking lives here.
 */
export { WorkoutSessionBuilder } from "./WorkoutSessionBuilder";
export type {
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionIntensity,
  WorkoutSessionProgressionReference,
  WorkoutSessionReps,
  WorkoutSessionSet,
  WorkoutSessionStatus,
} from "./WorkoutSessionBuilder";

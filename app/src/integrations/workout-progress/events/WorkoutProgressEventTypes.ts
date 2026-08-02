/** Supported workout progress integration event types — represent only. */
export type WorkoutProgressEventType =
  | "WorkoutStarted"
  | "WorkoutCompleted"
  | "WorkoutCancelled"
  | "WorkoutSkipped"
  | "ExerciseCompleted"
  | "SetCompleted"
  | "PersonalRecordAchieved"
  | "WorkoutVolumeUpdated";

export const WORKOUT_PROGRESS_EVENT_TYPES: readonly WorkoutProgressEventType[] =
  Object.freeze([
    "WorkoutStarted",
    "WorkoutCompleted",
    "WorkoutCancelled",
    "WorkoutSkipped",
    "ExerciseCompleted",
    "SetCompleted",
    "PersonalRecordAchieved",
    "WorkoutVolumeUpdated",
  ]);

export function isWorkoutProgressEventType(
  value: string,
): value is WorkoutProgressEventType {
  return (WORKOUT_PROGRESS_EVENT_TYPES as readonly string[]).includes(value);
}

/**
 * Immutable high-level intent derived from CoachResponse for planning.
 */
export type ActionIntent =
  | "start_workout"
  | "adjust_nutrition"
  | "recover"
  | "set_goal"
  | "schedule_reminder"
  | "track_progress"
  | "coach_followup"
  | "system_maintain"
  | "composite"
  | "unknown";

export const ActionIntents = Object.freeze({
  START_WORKOUT: "start_workout" as const,
  ADJUST_NUTRITION: "adjust_nutrition" as const,
  RECOVER: "recover" as const,
  SET_GOAL: "set_goal" as const,
  SCHEDULE_REMINDER: "schedule_reminder" as const,
  TRACK_PROGRESS: "track_progress" as const,
  COACH_FOLLOWUP: "coach_followup" as const,
  SYSTEM_MAINTAIN: "system_maintain" as const,
  COMPOSITE: "composite" as const,
  UNKNOWN: "unknown" as const,
});

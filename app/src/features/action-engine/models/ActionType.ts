/**
 * Immutable action type taxonomy for planned actions.
 * Metadata only — no execution semantics.
 */
export type ActionType =
  | "workout"
  | "nutrition"
  | "recovery"
  | "goal"
  | "reminder"
  | "progress"
  | "coach"
  | "system";

export const ActionTypes = Object.freeze({
  WORKOUT: "workout" as const,
  NUTRITION: "nutrition" as const,
  RECOVERY: "recovery" as const,
  GOAL: "goal" as const,
  REMINDER: "reminder" as const,
  PROGRESS: "progress" as const,
  COACH: "coach" as const,
  SYSTEM: "system" as const,
});

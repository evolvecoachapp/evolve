/**
 * Immutable target descriptor for a planned action.
 */
export interface ActionTarget {
  readonly id: string;
  readonly kind: ActionTargetKind;
  readonly label: string;
  readonly resourceId: string | null;
}

export type ActionTargetKind =
  | "workout"
  | "exercise"
  | "nutrition"
  | "recovery"
  | "goal"
  | "reminder"
  | "progress"
  | "coach"
  | "system"
  | "generic";

export const ActionTargetKinds = Object.freeze({
  WORKOUT: "workout" as const,
  EXERCISE: "exercise" as const,
  NUTRITION: "nutrition" as const,
  RECOVERY: "recovery" as const,
  GOAL: "goal" as const,
  REMINDER: "reminder" as const,
  PROGRESS: "progress" as const,
  COACH: "coach" as const,
  SYSTEM: "system" as const,
  GENERIC: "generic" as const,
});

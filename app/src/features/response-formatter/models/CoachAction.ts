/**
 * Immutable suggested coach action (no execution).
 */
export interface CoachAction {
  readonly id: string;
  readonly label: string;
  readonly description: string | null;
  readonly kind: CoachActionKind;
  readonly payload: Readonly<Record<string, string | number | boolean | null>>;
}

export type CoachActionKind =
  | "navigate"
  | "start_workout"
  | "log_metric"
  | "ask_followup"
  | "open_resource"
  | "generic";

export const CoachActionKinds = Object.freeze({
  NAVIGATE: "navigate" as const,
  START_WORKOUT: "start_workout" as const,
  LOG_METRIC: "log_metric" as const,
  ASK_FOLLOWUP: "ask_followup" as const,
  OPEN_RESOURCE: "open_resource" as const,
  GENERIC: "generic" as const,
});

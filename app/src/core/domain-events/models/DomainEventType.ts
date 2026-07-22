/**
 * Strongly typed domain event kinds for workout execution.
 */
export type DomainEventType =
  | "workout_started"
  | "workout_paused"
  | "workout_resumed"
  | "workout_completed"
  | "workout_cancelled"
  | "exercise_started"
  | "exercise_completed"
  | "exercise_skipped"
  | "set_started"
  | "set_completed"
  | "rest_started"
  | "rest_paused"
  | "rest_resumed"
  | "rest_completed"
  | "rest_cancelled";

export const DOMAIN_EVENT_TYPES = Object.freeze([
  "workout_started",
  "workout_paused",
  "workout_resumed",
  "workout_completed",
  "workout_cancelled",
  "exercise_started",
  "exercise_completed",
  "exercise_skipped",
  "set_started",
  "set_completed",
  "rest_started",
  "rest_paused",
  "rest_resumed",
  "rest_completed",
  "rest_cancelled",
] as const satisfies readonly DomainEventType[]);

export function isDomainEventType(value: string): value is DomainEventType {
  return (DOMAIN_EVENT_TYPES as readonly string[]).includes(value);
}

export function categoryForEventType(type: DomainEventType):
  | "workout"
  | "exercise"
  | "set"
  | "rest" {
  if (type.startsWith("workout_")) return "workout";
  if (type.startsWith("exercise_")) return "exercise";
  if (type.startsWith("set_")) return "set";
  return "rest";
}

/**
 * Domain category for a workout-execution event.
 */
export type EventCategory =
  | "workout"
  | "exercise"
  | "set"
  | "rest"
  | "session"
  | "system";

export const EVENT_CATEGORIES = Object.freeze([
  "workout",
  "exercise",
  "set",
  "rest",
  "session",
  "system",
] as const satisfies readonly EventCategory[]);

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}

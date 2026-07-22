/**
 * Severity of a domain event's impact on the workout session.
 */
export type EventSeverity = "info" | "low" | "medium" | "high" | "critical";

export const EVENT_SEVERITIES = Object.freeze([
  "info",
  "low",
  "medium",
  "high",
  "critical",
] as const satisfies readonly EventSeverity[]);

export function isEventSeverity(value: string): value is EventSeverity {
  return (EVENT_SEVERITIES as readonly string[]).includes(value);
}

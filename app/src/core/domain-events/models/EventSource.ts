/**
 * Origin of a domain event within the execution stack.
 */
export type EventSource =
  | "workout-runtime"
  | "rest-runtime"
  | "domain-events"
  | "system";

export const EVENT_SOURCES = Object.freeze([
  "workout-runtime",
  "rest-runtime",
  "domain-events",
  "system",
] as const satisfies readonly EventSource[]);

export function isEventSource(value: string): value is EventSource {
  return (EVENT_SOURCES as readonly string[]).includes(value);
}

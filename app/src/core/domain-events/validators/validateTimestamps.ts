import type { DomainEvent } from "../models/DomainEvent";

const ISO_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

/**
 * Validate a single timestamp string.
 */
export function validateTimestamp(timestamp: string): readonly string[] {
  const issues: string[] = [];

  if (typeof timestamp !== "string" || timestamp.trim().length === 0) {
    issues.push("invalid_timestamp:empty");
    return Object.freeze(issues);
  }

  if (!ISO_TIMESTAMP.test(timestamp)) {
    issues.push(`invalid_timestamp:format:${timestamp}`);
  } else if (Number.isNaN(Date.parse(timestamp))) {
    issues.push(`invalid_timestamp:unparseable:${timestamp}`);
  }

  return Object.freeze(issues);
}

/**
 * Validate event timestamps are present and non-decreasing by sequence order.
 */
export function validateTimestamps(
  events: readonly DomainEvent[],
): readonly string[] {
  const issues: string[] = [];
  let previousMs: number | null = null;

  for (const event of events) {
    issues.push(...validateTimestamp(event.timestamp));
    const ms = Date.parse(event.timestamp);
    if (!Number.isNaN(ms)) {
      if (previousMs !== null && ms < previousMs) {
        issues.push(
          `invalid_timestamp:ordering:${event.id}:${event.timestamp}`,
        );
      }
      previousMs = ms;
    }
  }

  return Object.freeze(issues);
}

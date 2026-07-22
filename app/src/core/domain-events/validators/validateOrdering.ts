import type { DomainEvent } from "../models/DomainEvent";
import { isValidEventSequence } from "../models/EventSequence";

/**
 * Validate deterministic sequence ordering (1..N contiguous).
 */
export function validateEventOrdering(
  events: readonly DomainEvent[],
): readonly string[] {
  const issues: string[] = [];

  for (let index = 0; index < events.length; index += 1) {
    const event = events[index];
    if (!event) continue;

    const expected = index + 1;
    if (!isValidEventSequence(event.sequence)) {
      issues.push(`invalid_ordering:sequence:${event.id}:${event.sequence}`);
      continue;
    }

    if (event.sequence !== expected) {
      issues.push(
        `invalid_ordering:expected_${expected}_got_${event.sequence}:${event.id}`,
      );
    }
  }

  return Object.freeze(issues);
}

/**
 * Detect duplicate sequence numbers.
 */
export function validateDuplicateSequence(
  events: readonly DomainEvent[],
): readonly string[] {
  const issues: string[] = [];
  const seen = new Map<number, string>();

  for (const event of events) {
    const existing = seen.get(event.sequence);
    if (existing) {
      issues.push(
        `duplicate_sequence:${event.sequence}:${existing},${event.id}`,
      );
    } else {
      seen.set(event.sequence, event.id);
    }
  }

  return Object.freeze(issues);
}

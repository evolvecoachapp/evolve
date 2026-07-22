import type { DomainEvent } from "../models/DomainEvent";
import { validateEventContext } from "./validateContext";
import { validateImmutablePayload } from "./validateImmutablePayload";
import { validateEventMetadata } from "./validateMetadata";
import {
  validateDuplicateSequence,
  validateEventOrdering,
} from "./validateOrdering";
import { validateTimestamp, validateTimestamps } from "./validateTimestamps";
import { validateEventType } from "./validateEventType";

/**
 * Validate a single domain event before publish.
 */
export function validateEvent(event: DomainEvent): readonly string[] {
  return Object.freeze([
    ...validateEventType(event),
    ...validateEventMetadata(event),
    ...validateEventContext(event),
    ...validateTimestamp(event.timestamp),
    ...validateImmutablePayload(event),
  ]);
}

/**
 * Validate a full ordered stream.
 */
export function validateEventStream(
  events: readonly DomainEvent[],
): readonly string[] {
  const issues: string[] = [];

  for (const event of events) {
    issues.push(...validateEvent(event));
  }

  issues.push(...validateEventOrdering(events));
  issues.push(...validateDuplicateSequence(events));
  issues.push(...validateTimestamps(events));

  return Object.freeze(issues);
}

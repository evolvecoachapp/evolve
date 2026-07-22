import { isDomainEventType } from "../models/DomainEventType";
import { categoryForEventType } from "../models/DomainEventType";
import type { DomainEvent } from "../models/DomainEvent";

/**
 * Validate that event type is known and matches category.
 */
export function validateEventType(event: DomainEvent): readonly string[] {
  const issues: string[] = [];

  if (!isDomainEventType(event.type)) {
    issues.push(`invalid_event_type:${String(event.type)}`);
    return Object.freeze(issues);
  }

  const expected = categoryForEventType(event.type);
  if (event.category !== expected) {
    issues.push(
      `invalid_event_type:category_mismatch:${event.type}:${event.category}`,
    );
  }

  return Object.freeze(issues);
}

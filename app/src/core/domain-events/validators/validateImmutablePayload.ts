import type { DomainEvent } from "../models/DomainEvent";

/**
 * Validate that payload (and nested arrays/objects when present) are frozen.
 */
export function validateImmutablePayload(
  event: DomainEvent,
): readonly string[] {
  const issues: string[] = [];

  if (event.payload === null || typeof event.payload !== "object") {
    issues.push(`mutable_payload:missing:${event.id}`);
    return Object.freeze(issues);
  }

  if (!Object.isFrozen(event.payload)) {
    issues.push(`mutable_payload:payload:${event.id}`);
  }

  if (!event.metadata || typeof event.metadata !== "object") {
    issues.push(`mutable_payload:metadata:${event.id}`);
  } else if (!Object.isFrozen(event.metadata)) {
    issues.push(`mutable_payload:metadata:${event.id}`);
  } else {
    if (!Object.isFrozen(event.metadata.tags)) {
      issues.push(`mutable_payload:metadata.tags:${event.id}`);
    }
    if (!Object.isFrozen(event.metadata.attributes)) {
      issues.push(`mutable_payload:metadata.attributes:${event.id}`);
    }
  }

  if (!event.context || typeof event.context !== "object") {
    issues.push(`mutable_payload:context:${event.id}`);
  } else if (!Object.isFrozen(event.context)) {
    issues.push(`mutable_payload:context:${event.id}`);
  }

  if (!Object.isFrozen(event)) {
    issues.push(`mutable_payload:event:${event.id}`);
  }

  return Object.freeze(issues);
}

import type { DomainEvent } from "../models/DomainEvent";
import type { EventContext } from "../models/EventContext";

/**
 * Validate context presence and required session identity.
 */
export function validateContext(
  context: EventContext | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!context) {
    issues.push("missing_context");
    return Object.freeze(issues);
  }

  if (
    typeof context.sessionId !== "string" ||
    context.sessionId.trim().length === 0
  ) {
    issues.push("missing_context:sessionId");
  }

  return Object.freeze(issues);
}

export function validateEventContext(event: DomainEvent): readonly string[] {
  return validateContext(event.context);
}

import type { DomainEvent } from "../models/DomainEvent";
import type { EventMetadata } from "../models/EventMetadata";

/**
 * Validate metadata presence and shape.
 */
export function validateMetadata(
  metadata: EventMetadata | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!metadata) {
    issues.push("missing_metadata");
    return Object.freeze(issues);
  }

  if (!Array.isArray(metadata.tags)) {
    issues.push("missing_metadata:tags");
  }

  if (
    metadata.attributes === null ||
    metadata.attributes === undefined ||
    typeof metadata.attributes !== "object"
  ) {
    issues.push("missing_metadata:attributes");
  }

  return Object.freeze(issues);
}

export function validateEventMetadata(event: DomainEvent): readonly string[] {
  return validateMetadata(event.metadata);
}

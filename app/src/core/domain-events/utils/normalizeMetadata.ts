import type { EventMetadata } from "../models/EventMetadata";
import { EMPTY_EVENT_METADATA } from "../models/EventMetadata";
import { freezeMetadata } from "./freezeEvents";

/**
 * Normalize optional / partial metadata into a frozen EventMetadata.
 */
export function normalizeMetadata(
  metadata?: Partial<EventMetadata> | null,
): EventMetadata {
  if (!metadata) {
    return EMPTY_EVENT_METADATA;
  }

  const tags = Object.freeze(
    [...(metadata.tags ?? [])]
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  );

  const attributes = Object.freeze({ ...(metadata.attributes ?? {}) });

  return freezeMetadata({ tags, attributes });
}

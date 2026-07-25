import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateTimelineConsistency(
  timeline: AdaptationTimeline | null,
): readonly AdaptationError[] {
  if (!timeline) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  const ids = new Set<string>();
  for (const item of timeline.items) {
    if (ids.has(item.id)) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TIMELINE,
          "Duplicate timeline item id",
          item.id,
        ),
      );
    }
    ids.add(item.id);
    if (!item.at) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TIMELINE,
          "Timeline item missing timestamp",
          item.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}

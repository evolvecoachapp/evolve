import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateTimelineIntegrity(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  let lastAt = "";
  for (const item of context.timeline.items) {
    if (!item.id) {
      issues.push({
        code: ContextIntegrityCodes.TIMELINE_INVALID,
        message: "Timeline item id is required.",
        path: "timeline.items",
      });
    }
    if (lastAt && item.at < lastAt) {
      issues.push({
        code: ContextIntegrityCodes.TIMELINE_INVALID,
        message: "Timeline items must be non-decreasing by time.",
        path: `timeline.items.${item.id}`,
      });
    }
    lastAt = item.at;
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

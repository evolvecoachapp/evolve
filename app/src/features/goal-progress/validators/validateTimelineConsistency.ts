import type { GoalTimeline } from "../models/GoalTimeline";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateTimelineConsistency(
  timeline: GoalTimeline | null,
): readonly GoalError[] {
  if (!timeline) return Object.freeze([]);
  const errors: GoalError[] = [];
  const ids = new Set<string>();
  for (const item of timeline.items) {
    if (ids.has(item.id)) {
      errors.push(
        createGoalError(
          GoalErrorCodes.INCONSISTENT_TIMELINE,
          "Duplicate timeline item id",
          item.id,
        ),
      );
    }
    ids.add(item.id);
    if (!item.at) {
      errors.push(
        createGoalError(
          GoalErrorCodes.INCONSISTENT_TIMELINE,
          "Timeline item missing timestamp",
          item.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}

import type { AthleteTimeline } from "../models/AthleteTimeline";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateTimelineConsistency(input: {
  readonly athleteId: string;
  readonly timeline: AthleteTimeline;
}): StateValidation {
  const issues = [];
  if (input.timeline.athleteId !== input.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_TIMELINE,
      message: "Timeline athleteId mismatch.",
      path: "timeline.athleteId",
    });
  }
  let prev = 0;
  for (const item of input.timeline.items) {
    if (item.sequence <= prev) {
      issues.push({
        code: StateValidationCodes.INVALID_TIMELINE,
        message: "Timeline sequence must be strictly increasing.",
        path: `timeline.items[${item.id}].sequence`,
      });
      break;
    }
    prev = item.sequence;
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

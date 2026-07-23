import type { MemoryTimeline } from "../models/MemoryTimeline";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import { freezeValidation } from "../utils/FreezeMemoryState";

/**
 * Validates timeline ordering / sequence integrity.
 */
export function validateTimelineIntegrity(
  timeline: MemoryTimeline | null | undefined,
): MemoryValidation {
  const issues: MemoryValidationIssue[] = [];

  if (!timeline) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.TIMELINE_INTEGRITY,
        message: "Memory timeline is required.",
        path: "timeline",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!timeline.id) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.MISSING_FIELD,
        message: "Timeline id is required.",
        path: "timeline.id",
      }),
    );
  }

  if (!Array.isArray(timeline.events)) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.TIMELINE_INTEGRITY,
        message: "Timeline events must be an array.",
        path: "timeline.events",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (timeline.eventCount !== timeline.events.length) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.TIMELINE_INTEGRITY,
        message: "Timeline eventCount does not match events length.",
        path: "timeline.eventCount",
      }),
    );
  }

  let previousSequence = 0;
  for (let i = 0; i < timeline.events.length; i++) {
    const event = timeline.events[i];
    if (event.sequence !== previousSequence + 1) {
      issues.push(
        Object.freeze({
          code: MemoryValidationCodes.TIMELINE_INTEGRITY,
          message: `Timeline sequence gap at index ${i}.`,
          path: `timeline.events[${i}].sequence`,
        }),
      );
      break;
    }
    previousSequence = event.sequence;
  }

  if (
    timeline.events.length > 0 &&
    timeline.nextSequence !== timeline.events.length + 1
  ) {
    issues.push(
      Object.freeze({
        code: MemoryValidationCodes.TIMELINE_INTEGRITY,
        message: "Timeline nextSequence is inconsistent.",
        path: "timeline.nextSequence",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

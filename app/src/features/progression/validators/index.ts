import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionRequest } from "../models/ProgressionRequest";
import type { ProgressionStep } from "../models/ProgressionStep";
import type { ProgressionWindow } from "../models/ProgressionWindow";
import { validateConstraintViolations } from "./validateConstraintViolations";
import { validateExerciseContinuity } from "./validateExerciseContinuity";
import { validateProgressionConsistency } from "./validateProgressionConsistency";
import {
  validateTimelineConsistency,
  validateWeekOrdering,
} from "./validateWeekOrdering";

/**
 * Run the full progression validation suite and return unique issue codes.
 */
export function validateProgressionPlan(
  request: ProgressionRequest,
  progressions: readonly ExerciseProgression[],
  timeline: readonly ProgressionStep[],
  window: ProgressionWindow,
): readonly string[] {
  const issues = [
    ...validateProgrammingPresent(request),
    ...validateWeekOrdering(progressions),
    ...validateTimelineConsistency(timeline, window.startWeek, window.weekCount),
    ...validateExerciseContinuity(progressions),
    ...validateProgressionConsistency(progressions),
    ...validateConstraintViolations(
      progressions,
      request.programming.context.constraints.map((constraint) =>
        Object.freeze({
          kind: constraint.kind,
          code: constraint.code,
          severity: constraint.severity,
          source: "programming" as const,
        }),
      ),
    ),
  ];
  return Object.freeze([...new Set(issues)]);
}

function validateProgrammingPresent(
  request: ProgressionRequest,
): readonly string[] {
  if (request.programming.prescriptions.length === 0) {
    return Object.freeze(["programming_empty"]);
  }
  return Object.freeze([]);
}

export { validateWeekOrdering, validateTimelineConsistency } from "./validateWeekOrdering";
export { validateExerciseContinuity } from "./validateExerciseContinuity";
export { validateProgressionConsistency } from "./validateProgressionConsistency";
export { validateConstraintViolations } from "./validateConstraintViolations";

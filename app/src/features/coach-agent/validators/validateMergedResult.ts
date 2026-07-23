import type { CoachDecision } from "../models/CoachDecision";
import type {
  CoachValidation,
  CoachValidationIssue,
} from "../models/CoachValidation";
import { CoachValidationCodes } from "../models/CoachValidation";
import { freezeValidation } from "../utils/FreezeCoachState";

/**
 * Validates a merged coaching decision.
 */
export function validateMergedResult(
  decision: CoachDecision | null | undefined,
): CoachValidation {
  const issues: CoachValidationIssue[] = [];

  if (!decision) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Coach decision is required.",
        path: "decision",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!decision.id) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Decision id is required.",
        path: "decision.id",
      }),
    );
  }

  if (
    typeof decision.confidenceScore !== "number" ||
    Number.isNaN(decision.confidenceScore) ||
    decision.confidenceScore < 0 ||
    decision.confidenceScore > 1
  ) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.INVALID_VALUE,
        message: "Confidence score must be between 0 and 1.",
        path: "decision.confidenceScore",
      }),
    );
  }

  if (!Array.isArray(decision.recommendations)) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MERGE_INVALID,
        message: "Recommendations must be an array.",
        path: "decision.recommendations",
      }),
    );
  }

  if (!Array.isArray(decision.conflicts)) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MERGE_INVALID,
        message: "Conflicts must be an array.",
        path: "decision.conflicts",
      }),
    );
  }

  if (!decision.decidedAt) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "decidedAt is required.",
        path: "decision.decidedAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

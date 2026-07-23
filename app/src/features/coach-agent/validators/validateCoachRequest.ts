import type { CoachRequest } from "../models/CoachRequest";
import type {
  CoachValidation,
  CoachValidationIssue,
} from "../models/CoachValidation";
import { CoachValidationCodes } from "../models/CoachValidation";
import { freezeValidation } from "../utils/FreezeCoachState";

/**
 * Validates inbound coach request shape (orchestration integrity only).
 */
export function validateCoachRequest(
  request: CoachRequest | null | undefined,
): CoachValidation {
  const issues: CoachValidationIssue[] = [];

  if (!request) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Coach request is required.",
        path: "request",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!request.id) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Request id is required.",
        path: "request.id",
      }),
    );
  }

  if (!request.message || request.message.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Request message is required.",
        path: "request.message",
      }),
    );
  }

  if (!request.createdAt) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Request createdAt is required.",
        path: "request.createdAt",
      }),
    );
  }

  if (!Array.isArray(request.agentHints)) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.INVALID_VALUE,
        message: "agentHints must be an array.",
        path: "request.agentHints",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

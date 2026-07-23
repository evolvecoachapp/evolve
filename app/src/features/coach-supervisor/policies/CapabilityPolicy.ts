import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function applyCapabilityPolicy(
  request: CoachSupervisorRequest,
): CoachSupervisorValidation {
  const issues = [];
  const seen = new Set<string>();
  for (const id of request.requiredCapabilityIds) {
    if (!id) {
      issues.push({
        code: CoachSupervisorValidationCodes.MISSING_CAPABILITY,
        message: "Empty capability id.",
        path: "requiredCapabilityIds",
      });
    } else if (seen.has(id)) {
      issues.push({
        code: CoachSupervisorValidationCodes.DUPLICATE_STEP,
        message: `Duplicate capability ${id}.`,
        path: "requiredCapabilityIds",
      });
    } else {
      seen.add(id);
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

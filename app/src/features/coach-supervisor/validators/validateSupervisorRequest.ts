import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";
import { applyCapabilityPolicy } from "../policies/CapabilityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";

export function validateSupervisorRequest(
  request: CoachSupervisorRequest,
): CoachSupervisorValidation {
  const issues = [
    ...applySafetyPolicy(request).issues,
    ...applyCapabilityPolicy(request).issues,
  ];
  if (request.requiredCapabilityIds.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.MISSING_CAPABILITY,
      message: "At least one capability is required.",
      path: "requiredCapabilityIds",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

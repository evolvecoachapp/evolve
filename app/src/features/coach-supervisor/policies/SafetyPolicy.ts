import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

/**
 * Structural safety checks only — no content moderation / AI.
 */
export function applySafetyPolicy(
  request: CoachSupervisorRequest,
): CoachSupervisorValidation {
  const issues = [];
  if (!request.id) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_REQUEST,
      message: "Request id is required.",
      path: "id",
    });
  }
  if (!request.intent.trim()) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_REQUEST,
      message: "Request intent is required.",
      path: "intent",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

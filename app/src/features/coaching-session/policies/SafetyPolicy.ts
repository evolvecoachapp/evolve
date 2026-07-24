import type { SessionRequest } from "../models/SessionRequest";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

/**
 * Structural safety checks only — no content moderation / AI.
 */
export function applySafetyPolicy(request: SessionRequest): SessionValidation {
  const issues = [];
  if (!request.id) {
    issues.push({
      code: SessionValidationCodes.SAFETY_VIOLATION,
      message: "Request id is required.",
      path: "id",
    });
  }
  if (!request.intent.trim() && request.kind !== "end" && request.kind !== "describe" && request.kind !== "validate") {
    issues.push({
      code: SessionValidationCodes.SAFETY_VIOLATION,
      message: "Request intent is required.",
      path: "intent",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

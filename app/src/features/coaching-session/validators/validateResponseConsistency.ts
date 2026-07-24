import type { SessionResponse } from "../models/SessionResponse";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function validateResponseConsistency(
  response: SessionResponse,
): SessionValidation {
  const issues = [];
  if (!response.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_RESPONSE,
      message: "Response sessionId is required.",
      path: "sessionId",
    });
  }
  if (!response.message.trim()) {
    issues.push({
      code: SessionValidationCodes.INVALID_RESPONSE,
      message: "Response message is required.",
      path: "message",
    });
  }
  if (response.confidence.score < 0 || response.confidence.score > 1) {
    issues.push({
      code: SessionValidationCodes.INVALID_RESPONSE,
      message: "Confidence score must be between 0 and 1.",
      path: "confidence.score",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

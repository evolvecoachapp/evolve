import type { SessionContext } from "../models/SessionContext";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function applyContextPolicy(
  context: SessionContext,
): SessionValidation {
  const issues = [];
  if (!context.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_CONTEXT,
      message: "Context sessionId is required.",
      path: "sessionId",
    });
  }
  if (context.state.sessionId !== context.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_CONTEXT,
      message: "Context state sessionId mismatch.",
      path: "state.sessionId",
    });
  }
  if (context.lifecycle.sessionId !== context.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_CONTEXT,
      message: "Context lifecycle sessionId mismatch.",
      path: "lifecycle.sessionId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

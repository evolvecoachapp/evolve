import type { SessionContext } from "../models/SessionContext";
import type { SessionResponse } from "../models/SessionResponse";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function applyConsistencyPolicy(input: {
  readonly context: SessionContext;
  readonly response: SessionResponse | null;
}): SessionValidation {
  const issues = [];
  const { context, response } = input;
  if (response && response.sessionId !== context.sessionId) {
    issues.push({
      code: SessionValidationCodes.CONSISTENCY_VIOLATION,
      message: "Response sessionId does not match context.",
      path: "response.sessionId",
    });
  }
  if (
    context.history.sessionId &&
    context.history.sessionId !== context.sessionId
  ) {
    issues.push({
      code: SessionValidationCodes.CONSISTENCY_VIOLATION,
      message: "History sessionId does not match context.",
      path: "history.sessionId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

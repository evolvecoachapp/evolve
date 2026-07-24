import type { SessionHistory } from "../models/SessionHistory";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function validateHistory(history: SessionHistory): SessionValidation {
  const issues = [];
  if (!history.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_HISTORY,
      message: "History sessionId is required.",
      path: "sessionId",
    });
  }
  for (let i = 0; i < history.entries.length; i += 1) {
    const entry = history.entries[i]!;
    if (entry.request.sessionId && entry.request.sessionId !== history.sessionId) {
      issues.push({
        code: SessionValidationCodes.INVALID_HISTORY,
        message: `History entry ${i} sessionId mismatch.`,
        path: `entries[${i}].request.sessionId`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

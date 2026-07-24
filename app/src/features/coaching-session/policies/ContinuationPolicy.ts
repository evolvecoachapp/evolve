import { SessionRequestKinds, type SessionRequest } from "../models/SessionRequest";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function applyContinuationPolicy(
  request: SessionRequest,
): SessionValidation {
  const issues = [];
  if (
    (request.kind === SessionRequestKinds.CONTINUE ||
      request.kind === SessionRequestKinds.END) &&
    !request.sessionId
  ) {
    issues.push({
      code: SessionValidationCodes.INVALID_REQUEST,
      message: "sessionId is required for continue/end.",
      path: "sessionId",
    });
  }
  if (
    request.kind === SessionRequestKinds.CONTINUE &&
    !request.message.trim()
  ) {
    issues.push({
      code: SessionValidationCodes.INVALID_REQUEST,
      message: "Continue request requires a message.",
      path: "message",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

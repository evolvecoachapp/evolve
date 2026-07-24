import { SessionRequestKinds, type SessionRequest } from "../models/SessionRequest";
import {
  SessionStatuses,
  type SessionStatus,
} from "../models/SessionState";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";
import { isTerminalStatus } from "../utils/SessionHelpers";

/**
 * Deterministic lifecycle transition policy.
 */
export function applyLifecyclePolicy(input: {
  readonly request: SessionRequest;
  readonly currentStatus: SessionStatus | null;
}): SessionValidation {
  const issues = [];
  const { request, currentStatus } = input;

  if (request.kind === SessionRequestKinds.START) {
    if (currentStatus && !isTerminalStatus(currentStatus) && currentStatus !== SessionStatuses.IDLE) {
      issues.push({
        code: SessionValidationCodes.INVALID_LIFECYCLE,
        message: "Cannot start a session that is already active.",
        path: "status",
      });
    }
  }

  if (request.kind === SessionRequestKinds.CONTINUE) {
    if (!currentStatus) {
      issues.push({
        code: SessionValidationCodes.SESSION_NOT_FOUND,
        message: "Cannot continue — session does not exist.",
        path: "sessionId",
      });
    } else if (
      currentStatus !== SessionStatuses.ACTIVE &&
      currentStatus !== SessionStatuses.CONTINUING
    ) {
      issues.push({
        code: SessionValidationCodes.INVALID_TRANSITION,
        message: `Cannot continue from status '${currentStatus}'.`,
        path: "status",
      });
    }
  }

  if (request.kind === SessionRequestKinds.END) {
    if (!currentStatus) {
      issues.push({
        code: SessionValidationCodes.SESSION_NOT_FOUND,
        message: "Cannot end — session does not exist.",
        path: "sessionId",
      });
    } else if (isTerminalStatus(currentStatus)) {
      issues.push({
        code: SessionValidationCodes.SESSION_ALREADY_ENDED,
        message: "Session already ended.",
        path: "status",
      });
    }
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

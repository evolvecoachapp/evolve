import { applyLifecyclePolicy } from "../policies/LifecyclePolicy";
import type { SessionLifecycle } from "../models/SessionLifecycle";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionStatus } from "../models/SessionState";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";

export function validateLifecycle(input: {
  readonly request: SessionRequest;
  readonly currentStatus: SessionStatus | null;
  readonly lifecycle?: SessionLifecycle | null;
}): SessionValidation {
  const issues = [
    ...applyLifecyclePolicy({
      request: input.request,
      currentStatus: input.currentStatus,
    }).issues,
  ];
  if (input.lifecycle && !input.lifecycle.sessionId) {
    issues.push({
      code: SessionValidationCodes.INVALID_LIFECYCLE,
      message: "Lifecycle sessionId is required.",
      path: "lifecycle.sessionId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

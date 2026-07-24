import { applyContinuationPolicy } from "../policies/ContinuationPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionValidation } from "../models/SessionValidation";

export function validateSessionRequest(
  request: SessionRequest,
): SessionValidation {
  const issues = [
    ...applySafetyPolicy(request).issues,
    ...applyContinuationPolicy(request).issues,
  ];
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

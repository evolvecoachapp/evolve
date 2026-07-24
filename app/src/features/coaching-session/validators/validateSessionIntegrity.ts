import type { SessionContext } from "../models/SessionContext";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResponse } from "../models/SessionResponse";
import {
  SessionValidationCodes,
  type SessionValidation,
} from "../models/SessionValidation";
import { validateContext } from "./validateContext";
import { validateResponseConsistency } from "./validateResponseConsistency";
import { validateSessionRequest } from "./validateSessionRequest";

/**
 * Structural integrity only.
 * Lifecycle transitions are validated separately before state is applied
 * (do not re-check start/continue against the post-transition status).
 */
export function validateSessionIntegrity(input: {
  readonly request?: SessionRequest | null;
  readonly context?: SessionContext | null;
  readonly response?: SessionResponse | null;
}): SessionValidation {
  const issues = [];
  if (input.request) {
    issues.push(...validateSessionRequest(input.request).issues);
  }
  if (input.context) {
    if (!input.context.lifecycle.sessionId) {
      issues.push({
        code: SessionValidationCodes.INVALID_LIFECYCLE,
        message: "Lifecycle sessionId is required.",
        path: "lifecycle.sessionId",
      });
    }
    issues.push(
      ...validateContext({
        context: input.context,
        response: input.response ?? null,
      }).issues,
    );
  }
  if (input.response) {
    issues.push(...validateResponseConsistency(input.response).issues);
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

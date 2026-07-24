export const SessionValidationCodes = {
  INVALID_REQUEST: "invalid_request",
  INVALID_TRANSITION: "invalid_transition",
  INVALID_LIFECYCLE: "invalid_lifecycle",
  INVALID_CONTEXT: "invalid_context",
  INVALID_HISTORY: "invalid_history",
  INVALID_RESPONSE: "invalid_response",
  SESSION_NOT_FOUND: "session_not_found",
  SESSION_ALREADY_ENDED: "session_already_ended",
  SAFETY_VIOLATION: "safety_violation",
  CONSISTENCY_VIOLATION: "consistency_violation",
} as const;

export type SessionValidationCode =
  (typeof SessionValidationCodes)[keyof typeof SessionValidationCodes];

export interface SessionValidationIssue {
  readonly code: SessionValidationCode | string;
  readonly message: string;
  readonly path: string | null;
}

export interface SessionValidation {
  readonly valid: boolean;
  readonly issues: readonly SessionValidationIssue[];
}

export const EMPTY_SESSION_VALIDATION: SessionValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as SessionValidationIssue[]),
});

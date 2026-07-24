export const StateValidationCodes = {
  INVALID_IDENTITY: "invalid_identity",
  INVALID_VERSION: "invalid_version",
  INVALID_TIMELINE: "invalid_timeline",
  INVALID_SNAPSHOT: "invalid_snapshot",
  INVALID_MEASUREMENTS: "invalid_measurements",
  INVALID_GOALS: "invalid_goals",
  INVALID_PREFERENCES: "invalid_preferences",
  INVALID_HISTORY: "invalid_history",
  INVALID_TRANSITION: "invalid_transition",
  INTEGRITY_VIOLATION: "integrity_violation",
  CONSISTENCY_VIOLATION: "consistency_violation",
  SAFETY_VIOLATION: "safety_violation",
  MISSING_STATE: "missing_state",
} as const;

export type StateValidationCode =
  (typeof StateValidationCodes)[keyof typeof StateValidationCodes];

export interface StateValidationIssue {
  readonly code: StateValidationCode | string;
  readonly message: string;
  readonly path: string | null;
}

export interface StateValidation {
  readonly valid: boolean;
  readonly issues: readonly StateValidationIssue[];
}

export const EMPTY_STATE_VALIDATION: StateValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as StateValidationIssue[]),
});

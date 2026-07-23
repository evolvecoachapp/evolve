export const CoachSupervisorValidationCodes = {
  INVALID_REQUEST: "invalid_request",
  INVALID_PLAN: "invalid_plan",
  INVALID_ROUTING: "invalid_routing",
  INVALID_AGGREGATION: "invalid_aggregation",
  INVALID_EXECUTION: "invalid_execution",
  INVALID_RESPONSE: "invalid_response",
  MISSING_CAPABILITY: "missing_capability",
  MISSING_DEPENDENCY: "missing_dependency",
  DUPLICATE_STEP: "duplicate_step",
  INCONSISTENT_ORDER: "inconsistent_order",
} as const;

export type CoachSupervisorValidationCode =
  (typeof CoachSupervisorValidationCodes)[keyof typeof CoachSupervisorValidationCodes];

export interface CoachSupervisorValidationIssue {
  readonly code: CoachSupervisorValidationCode | string;
  readonly message: string;
  readonly path: string | null;
}

export interface CoachSupervisorValidation {
  readonly valid: boolean;
  readonly issues: readonly CoachSupervisorValidationIssue[];
}

export const EMPTY_SUPERVISOR_VALIDATION: CoachSupervisorValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as CoachSupervisorValidationIssue[]),
});

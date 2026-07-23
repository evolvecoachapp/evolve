/**
 * Validation codes for Agent Collaboration integrity checks.
 */
export const CollaborationValidationCodes = {
  MISSING_FIELD: "missing_field",
  INVALID_VALUE: "invalid_value",
  INVALID_PARTICIPANT: "invalid_participant",
  DUPLICATE_PARTICIPANT: "duplicate_participant",
  INELIGIBLE_PARTICIPANT: "ineligible_participant",
  INVALID_ORDER: "invalid_order",
  EMPTY_PLAN: "empty_plan",
  AGGREGATION_INVALID: "aggregation_invalid",
  PLAN_INTEGRITY: "plan_integrity",
  REQUEST_INVALID: "request_invalid",
} as const;

export type CollaborationValidationCode =
  (typeof CollaborationValidationCodes)[keyof typeof CollaborationValidationCodes];

export interface CollaborationValidationIssue {
  readonly code: CollaborationValidationCode;
  readonly message: string;
  readonly path: string;
}

export interface CollaborationValidation {
  readonly valid: boolean;
  readonly issues: readonly CollaborationValidationIssue[];
}

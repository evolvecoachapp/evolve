/**
 * Validation codes for Conversation Memory integrity checks.
 */
export const MemoryValidationCodes = {
  MISSING_FIELD: "missing_field",
  INVALID_VALUE: "invalid_value",
  INVALID_CATEGORY: "invalid_category",
  CATEGORY_INCOMPATIBLE: "category_incompatible",
  TIMELINE_INTEGRITY: "timeline_integrity",
  SNAPSHOT_INTEGRITY: "snapshot_integrity",
  UPDATE_INVALID: "update_invalid",
  QUERY_INVALID: "query_invalid",
} as const;

export type MemoryValidationCode =
  (typeof MemoryValidationCodes)[keyof typeof MemoryValidationCodes];

export interface MemoryValidationIssue {
  readonly code: MemoryValidationCode;
  readonly message: string;
  readonly path: string;
}

export interface MemoryValidation {
  readonly valid: boolean;
  readonly issues: readonly MemoryValidationIssue[];
}

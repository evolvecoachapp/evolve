/**
 * Conflict / failure codes for restore attempts.
 */
export const RestoreConflictCodes = {
  UNKNOWN_TARGET: "UNKNOWN_TARGET",
  HISTORY_NOT_FOUND: "HISTORY_NOT_FOUND",
  TARGET_NOT_FOUND: "TARGET_NOT_FOUND",
  SNAPSHOT_CORRUPTED: "SNAPSHOT_CORRUPTED",
  INTEGRITY_FAILED: "INTEGRITY_FAILED",
  INCOMPATIBLE_PLAN_TYPE: "INCOMPATIBLE_PLAN_TYPE",
  HISTORY_INCONSISTENT: "HISTORY_INCONSISTENT",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NO_PREVIOUS_VERSION: "NO_PREVIOUS_VERSION",
  MISSING_PLAN_PAYLOAD: "MISSING_PLAN_PAYLOAD",
} as const;

export type RestoreConflictCode =
  (typeof RestoreConflictCodes)[keyof typeof RestoreConflictCodes];

/**
 * Immutable restore conflict descriptor.
 */
export interface RestoreConflict {
  readonly code: RestoreConflictCode;
  readonly message: string;
  readonly field: string | null;
}

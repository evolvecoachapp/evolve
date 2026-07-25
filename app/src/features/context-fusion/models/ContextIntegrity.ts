export const ContextIntegrityCodes = {
  MISSING_ID: "missing_id",
  MISSING_ATHLETE: "missing_athlete",
  INVALID_VERSION: "invalid_version",
  DEPENDENCY_BREAK: "dependency_break",
  MERGE_INCONSISTENT: "merge_inconsistent",
  CONFLICT_UNRESOLVED: "conflict_unresolved",
  SNAPSHOT_INVALID: "snapshot_invalid",
  TIMELINE_INVALID: "timeline_invalid",
  INTEGRITY_VIOLATION: "integrity_violation",
} as const;

export type ContextIntegrityCode =
  (typeof ContextIntegrityCodes)[keyof typeof ContextIntegrityCodes];

export interface ContextIntegrityIssue {
  readonly code: ContextIntegrityCode | string;
  readonly message: string;
  readonly path: string;
}

/**
 * Immutable integrity report for fused context.
 */
export interface ContextIntegrity {
  readonly valid: boolean;
  readonly issues: readonly ContextIntegrityIssue[];
}

export const EMPTY_CONTEXT_INTEGRITY: ContextIntegrity = Object.freeze({
  valid: true,
  issues: Object.freeze([] as ContextIntegrityIssue[]),
});

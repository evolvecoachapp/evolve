/**
 * Immutable validation issue for Tool Runtime integrity checks.
 */
export interface ToolExecutionValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export interface ToolExecutionValidation {
  readonly valid: boolean;
  readonly issues: readonly ToolExecutionValidationIssue[];
}

export const ToolExecutionValidationCodes = Object.freeze({
  MISSING_PLAN_ID: "missing_plan_id" as const,
  MISSING_ACTION_PLAN_ID: "missing_action_plan_id" as const,
  MISSING_STEP_ID: "missing_step_id" as const,
  DUPLICATE_STEP_ID: "duplicate_step_id" as const,
  INVALID_DEPENDENCY: "invalid_dependency" as const,
  CIRCULAR_DEPENDENCY: "circular_dependency" as const,
  INVALID_ORDER: "invalid_order" as const,
  ADAPTER_UNAVAILABLE: "adapter_unavailable" as const,
  TOOL_UNRESOLVED: "tool_unresolved" as const,
  CONTEXT_INVALID: "context_invalid" as const,
  PIPELINE_INCONSISTENT: "pipeline_inconsistent" as const,
  INTEGRITY_VIOLATION: "integrity_violation" as const,
  PLAN_STEP_MISMATCH: "plan_step_mismatch" as const,
});

export type ToolExecutionValidationCode =
  (typeof ToolExecutionValidationCodes)[keyof typeof ToolExecutionValidationCodes];

/**
 * Immutable planning-time validation result (no execution validation).
 */
export interface ActionValidation {
  readonly valid: boolean;
  readonly issues: readonly ActionValidationIssue[];
}

export interface ActionValidationIssue {
  readonly code: ActionValidationCode;
  readonly message: string;
  readonly path: string | null;
}

export type ActionValidationCode =
  | "missing_id"
  | "missing_source"
  | "empty_steps"
  | "invalid_step"
  | "invalid_dependency"
  | "invalid_argument"
  | "invalid_target"
  | "invalid_priority"
  | "invalid_constraint"
  | "plan_inconsistency"
  | "package_incomplete"
  | "duplicate_step_id"
  | "circular_dependency";

export const ActionValidationCodes = Object.freeze({
  MISSING_ID: "missing_id" as const,
  MISSING_SOURCE: "missing_source" as const,
  EMPTY_STEPS: "empty_steps" as const,
  INVALID_STEP: "invalid_step" as const,
  INVALID_DEPENDENCY: "invalid_dependency" as const,
  INVALID_ARGUMENT: "invalid_argument" as const,
  INVALID_TARGET: "invalid_target" as const,
  INVALID_PRIORITY: "invalid_priority" as const,
  INVALID_CONSTRAINT: "invalid_constraint" as const,
  PLAN_INCONSISTENCY: "plan_inconsistency" as const,
  PACKAGE_INCOMPLETE: "package_incomplete" as const,
  DUPLICATE_STEP_ID: "duplicate_step_id" as const,
  CIRCULAR_DEPENDENCY: "circular_dependency" as const,
});

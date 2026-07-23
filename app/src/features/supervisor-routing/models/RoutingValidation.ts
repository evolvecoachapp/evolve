/**
 * Validation issue codes for routing plans / graphs.
 */
export const RoutingValidationCodes = {
  INVALID_REQUEST: "invalid_request",
  MISSING_CAPABILITY: "missing_capability",
  DISABLED_CAPABILITY: "disabled_capability",
  UNRESOLVED_CAPABILITY: "unresolved_capability",
  CYCLE_DETECTED: "cycle_detected",
  INVALID_DEPENDENCY: "invalid_dependency",
  DUPLICATE_TARGET: "duplicate_target",
  DUPLICATE_CAPABILITY: "duplicate_capability",
  INVALID_EXECUTION_ORDER: "invalid_execution_order",
  GRAPH_INTEGRITY: "graph_integrity",
  CONSTRAINT_VIOLATION: "constraint_violation",
  INCONSISTENT_PLAN: "inconsistent_plan",
  EMPTY_PLAN: "empty_plan",
  FORBIDDEN_AGENT: "forbidden_agent",
  MAX_TARGETS_EXCEEDED: "max_targets_exceeded",
} as const;

export type RoutingValidationCode =
  (typeof RoutingValidationCodes)[keyof typeof RoutingValidationCodes];

export interface RoutingValidationIssue {
  readonly code: RoutingValidationCode;
  readonly message: string;
  readonly path: string;
}

export interface RoutingValidation {
  readonly valid: boolean;
  readonly issues: readonly RoutingValidationIssue[];
}

/**
 * Immutable failure payload for a single tool invocation.
 */
export interface ToolFailure {
  readonly stepId: string;
  readonly toolId: string | null;
  readonly adapterId: string | null;
  readonly code: string;
  readonly message: string;
  readonly details: unknown;
  readonly durationMs: number | null;
  readonly completedAt: string;
}

export const ToolFailureCodes = Object.freeze({
  ADAPTER_UNAVAILABLE: "adapter_unavailable" as const,
  TOOL_UNRESOLVED: "tool_unresolved" as const,
  DEPENDENCY_BLOCKED: "dependency_blocked" as const,
  DISPATCH_REJECTED: "dispatch_rejected" as const,
  ADAPTER_FAILED: "adapter_failed" as const,
  VALIDATION_FAILED: "validation_failed" as const,
  POLICY_BLOCKED: "policy_blocked" as const,
  CANCELLED: "cancelled" as const,
  UNKNOWN: "unknown" as const,
});

export type ToolFailureCode =
  (typeof ToolFailureCodes)[keyof typeof ToolFailureCodes];

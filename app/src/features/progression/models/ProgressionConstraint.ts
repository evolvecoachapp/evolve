export type ProgressionConstraintSeverity = "soft" | "hard";

export const PROGRESSION_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly ProgressionConstraintSeverity[]);

export type ProgressionConstraintSource =
  | "blueprint"
  | "programming"
  | "request";

export const PROGRESSION_CONSTRAINT_SOURCES = Object.freeze([
  "blueprint",
  "programming",
  "request",
] as const satisfies readonly ProgressionConstraintSource[]);

/**
 * Constraint influencing progression timeline construction.
 * Strategy-level only — never fatigue, readiness, or autoregulation.
 */
export interface ProgressionConstraint {
  readonly kind: string;
  readonly code: string;
  readonly severity: ProgressionConstraintSeverity;
  readonly source: ProgressionConstraintSource;
}

/** Constraint severity for selection filtering. */
export type SelectionConstraintSeverity = "soft" | "hard";

export const SELECTION_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly SelectionConstraintSeverity[]);

/** Origin of a selection constraint. */
export type SelectionConstraintSource = "blueprint" | "request";

export const SELECTION_CONSTRAINT_SOURCES = Object.freeze([
  "blueprint",
  "request",
] as const satisfies readonly SelectionConstraintSource[]);

/**
 * Normalized selection constraint derived from blueprint / request inputs.
 */
export interface SelectionConstraint {
  readonly kind: string;
  readonly code: string;
  readonly severity: SelectionConstraintSeverity;
  readonly source: SelectionConstraintSource;
}

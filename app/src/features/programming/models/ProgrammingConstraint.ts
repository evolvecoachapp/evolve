export type ProgrammingConstraintSeverity = "soft" | "hard";

export const PROGRAMMING_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly ProgrammingConstraintSeverity[]);

export type ProgrammingConstraintSource = "blueprint" | "selection" | "request";

export const PROGRAMMING_CONSTRAINT_SOURCES = Object.freeze([
  "blueprint",
  "selection",
  "request",
] as const satisfies readonly ProgrammingConstraintSource[]);

/**
 * Constraint influencing prescription construction.
 * Strategy-level only — never progression or autoregulation.
 */
export interface ProgrammingConstraint {
  readonly kind: string;
  readonly code: string;
  readonly severity: ProgrammingConstraintSeverity;
  readonly source: ProgrammingConstraintSource;
}

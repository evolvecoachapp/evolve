/** Constraint categories the blueprint must honor. */
export type WorkoutConstraintKind =
  | "equipment"
  | "injury"
  | "time"
  | "frequency"
  | "recovery"
  | "preference";

export const WORKOUT_CONSTRAINT_KINDS = Object.freeze([
  "equipment",
  "injury",
  "time",
  "frequency",
  "recovery",
  "preference",
] as const satisfies readonly WorkoutConstraintKind[]);

export type WorkoutConstraintSeverity = "soft" | "hard";

export const WORKOUT_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly WorkoutConstraintSeverity[]);

/**
 * Structured training constraint — codes only, never prose instructions.
 */
export interface WorkoutConstraint {
  readonly kind: WorkoutConstraintKind;
  /** Domain code identifying the constraint (e.g. "knee_limitation"). */
  readonly code: string;
  readonly severity: WorkoutConstraintSeverity;
}

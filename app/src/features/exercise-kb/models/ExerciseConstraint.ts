/** Constraint categories for exercise knowledge. */
export type ExerciseConstraintKind =
  | "contraindication"
  | "equipment"
  | "skill"
  | "joint"
  | "axial"
  | "preference";

export const EXERCISE_CONSTRAINT_KINDS = Object.freeze([
  "contraindication",
  "equipment",
  "skill",
  "joint",
  "axial",
  "preference",
] as const satisfies readonly ExerciseConstraintKind[]);

export type ExerciseConstraintSeverity = "soft" | "hard";

export const EXERCISE_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly ExerciseConstraintSeverity[]);

/**
 * Structured exercise constraint — codes only, never prose instructions.
 */
export interface ExerciseConstraint {
  readonly kind: ExerciseConstraintKind;
  /** Domain code (e.g. "knee_limitation", "spinal_loading"). */
  readonly code: string;
  readonly severity: ExerciseConstraintSeverity;
}

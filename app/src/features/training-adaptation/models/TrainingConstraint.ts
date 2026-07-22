export type TrainingConstraintSeverity = "soft" | "hard";

export const TRAINING_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly TrainingConstraintSeverity[]);

export type TrainingConstraintSource =
  | "blueprint"
  | "progression"
  | "request";

export const TRAINING_CONSTRAINT_SOURCES = Object.freeze([
  "blueprint",
  "progression",
  "request",
] as const satisfies readonly TrainingConstraintSource[]);

/**
 * Constraint influencing readiness assessment and adaptation recommendations.
 * Domain representation only — never physiological signals or wearables.
 */
export interface TrainingConstraint {
  readonly kind: string;
  readonly code: string;
  readonly severity: TrainingConstraintSeverity;
  readonly source: TrainingConstraintSource;
}

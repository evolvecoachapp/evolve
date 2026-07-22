export type WorkoutAssemblyConstraintSeverity = "soft" | "hard";

export type WorkoutAssemblyConstraintSource =
  | "blueprint"
  | "selection"
  | "programming"
  | "progression"
  | "adaptation"
  | "request";

export const WORKOUT_ASSEMBLY_CONSTRAINT_SEVERITIES = Object.freeze([
  "soft",
  "hard",
] as const satisfies readonly WorkoutAssemblyConstraintSeverity[]);

export const WORKOUT_ASSEMBLY_CONSTRAINT_SOURCES = Object.freeze([
  "blueprint",
  "selection",
  "programming",
  "progression",
  "adaptation",
  "request",
] as const satisfies readonly WorkoutAssemblyConstraintSource[]);

/**
 * Constraint carried into assembly context from upstream pipeline stages.
 */
export interface WorkoutAssemblyConstraint {
  readonly kind: string;
  readonly code: string;
  readonly severity: WorkoutAssemblyConstraintSeverity;
  readonly source: WorkoutAssemblyConstraintSource;
}

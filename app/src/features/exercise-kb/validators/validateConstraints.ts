import type { ExerciseConstraint } from "../models/ExerciseConstraint";
import {
  EXERCISE_CONSTRAINT_KINDS,
  EXERCISE_CONSTRAINT_SEVERITIES,
} from "../models/ExerciseConstraint";

export type ConstraintsValidationCode =
  | "invalid_constraints"
  | "invalid_constraint_kind"
  | "missing_constraint_code"
  | "invalid_constraint_severity";

/**
 * Validate an array of ExerciseConstraint entries.
 */
export function validateConstraints(
  constraints: unknown,
): readonly ConstraintsValidationCode[] {
  const issues: ConstraintsValidationCode[] = [];

  if (!Array.isArray(constraints)) {
    return Object.freeze(["invalid_constraints"]);
  }

  for (const entry of constraints) {
    if (entry === null || typeof entry !== "object") {
      issues.push("invalid_constraints");
      continue;
    }

    const constraint = entry as Partial<ExerciseConstraint>;

    if (
      typeof constraint.kind !== "string" ||
      !(EXERCISE_CONSTRAINT_KINDS as readonly string[]).includes(constraint.kind)
    ) {
      issues.push("invalid_constraint_kind");
    }

    if (
      typeof constraint.code !== "string" ||
      constraint.code.trim().length === 0
    ) {
      issues.push("missing_constraint_code");
    }

    if (
      typeof constraint.severity !== "string" ||
      !(EXERCISE_CONSTRAINT_SEVERITIES as readonly string[]).includes(
        constraint.severity,
      )
    ) {
      issues.push("invalid_constraint_severity");
    }
  }

  return Object.freeze([...new Set(issues)]);
}

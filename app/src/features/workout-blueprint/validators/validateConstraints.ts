import type { WorkoutConstraint } from "../models/WorkoutConstraint";
import {
  WORKOUT_CONSTRAINT_KINDS,
  WORKOUT_CONSTRAINT_SEVERITIES,
} from "../models/WorkoutConstraint";

export type ConstraintsValidationCode =
  | "invalid_constraints"
  | "invalid_constraint_kind"
  | "missing_constraint_code"
  | "invalid_constraint_severity";

/**
 * Validate a list of WorkoutConstraint entries.
 */
export function validateConstraints(
  constraints: unknown,
): readonly ConstraintsValidationCode[] {
  if (!Array.isArray(constraints)) {
    return Object.freeze(["invalid_constraints"]);
  }

  const issues: ConstraintsValidationCode[] = [];

  for (const entry of constraints) {
    if (entry === null || typeof entry !== "object") {
      issues.push("invalid_constraints");
      continue;
    }

    const candidate = entry as Partial<WorkoutConstraint>;

    if (
      typeof candidate.kind !== "string" ||
      !(WORKOUT_CONSTRAINT_KINDS as readonly string[]).includes(candidate.kind)
    ) {
      issues.push("invalid_constraint_kind");
    }

    if (
      typeof candidate.code !== "string" ||
      candidate.code.trim().length === 0
    ) {
      issues.push("missing_constraint_code");
    }

    if (
      typeof candidate.severity !== "string" ||
      !(WORKOUT_CONSTRAINT_SEVERITIES as readonly string[]).includes(
        candidate.severity,
      )
    ) {
      issues.push("invalid_constraint_severity");
    }
  }

  return Object.freeze([...new Set(issues)]);
}

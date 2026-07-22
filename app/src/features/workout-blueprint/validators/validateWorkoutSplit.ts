import type { WorkoutSplit } from "../models/WorkoutSplit";
import { WORKOUT_SPLIT_TYPES } from "../models/WorkoutSplit";

export type WorkoutSplitValidationCode =
  | "missing_split_type"
  | "invalid_split_type"
  | "invalid_days_per_week"
  | "invalid_cycle_length";

/**
 * Validate a WorkoutSplit structural contract.
 */
export function validateWorkoutSplit(
  split: unknown,
): readonly WorkoutSplitValidationCode[] {
  const issues: WorkoutSplitValidationCode[] = [];

  if (split === null || typeof split !== "object") {
    return Object.freeze([
      "missing_split_type",
      "invalid_days_per_week",
      "invalid_cycle_length",
    ]);
  }

  const candidate = split as Partial<WorkoutSplit>;

  if (typeof candidate.type !== "string" || candidate.type.trim().length === 0) {
    issues.push("missing_split_type");
  } else if (
    !(WORKOUT_SPLIT_TYPES as readonly string[]).includes(candidate.type)
  ) {
    issues.push("invalid_split_type");
  }

  if (
    typeof candidate.daysPerWeek !== "number" ||
    !Number.isInteger(candidate.daysPerWeek) ||
    candidate.daysPerWeek < 1 ||
    candidate.daysPerWeek > 7
  ) {
    issues.push("invalid_days_per_week");
  }

  if (
    typeof candidate.cycleLengthDays !== "number" ||
    !Number.isInteger(candidate.cycleLengthDays) ||
    candidate.cycleLengthDays < 1 ||
    candidate.cycleLengthDays > 14
  ) {
    issues.push("invalid_cycle_length");
  }

  return Object.freeze([...new Set(issues)]);
}

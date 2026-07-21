import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";

const MIN_AGE = 13;
const MAX_AGE = 100;

/**
 * Validate athlete age in years.
 *
 * Returns structured issues; never throws for validation failures.
 * `null` is allowed (unknown age).
 */
export function validateAge(
  ageYears: number | null,
): readonly AthleteContextValidationIssue[] {
  if (ageYears === null) {
    return Object.freeze([]);
  }

  if (
    !Number.isFinite(ageYears) ||
    !Number.isInteger(ageYears) ||
    ageYears < MIN_AGE ||
    ageYears > MAX_AGE
  ) {
    return Object.freeze([
      Object.freeze({
        field: "ageYears",
        code: "invalid_age" as const,
      }),
    ]);
  }

  return Object.freeze([]);
}

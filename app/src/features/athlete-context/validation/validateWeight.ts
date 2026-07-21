import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";

const MIN_WEIGHT_KG = 30;
const MAX_WEIGHT_KG = 300;

/**
 * Validate canonical body weight in kilograms.
 *
 * Returns structured issues; never throws for validation failures.
 * `null` is allowed (unknown weight).
 */
export function validateWeight(
  weightKg: number | null,
): readonly AthleteContextValidationIssue[] {
  if (weightKg === null) {
    return Object.freeze([]);
  }

  if (
    !Number.isFinite(weightKg) ||
    weightKg < MIN_WEIGHT_KG ||
    weightKg > MAX_WEIGHT_KG
  ) {
    return Object.freeze([
      Object.freeze({
        field: "weightKg",
        code: "invalid_weight" as const,
      }),
    ]);
  }

  return Object.freeze([]);
}

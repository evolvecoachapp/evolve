import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";

const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 250;

/**
 * Validate canonical height in centimeters.
 *
 * Returns structured issues; never throws for validation failures.
 * `null` is allowed (unknown height).
 */
export function validateHeight(
  heightCm: number | null,
): readonly AthleteContextValidationIssue[] {
  if (heightCm === null) {
    return Object.freeze([]);
  }

  if (
    !Number.isFinite(heightCm) ||
    heightCm < MIN_HEIGHT_CM ||
    heightCm > MAX_HEIGHT_CM
  ) {
    return Object.freeze([
      Object.freeze({
        field: "heightCm",
        code: "invalid_height" as const,
      }),
    ]);
  }

  return Object.freeze([]);
}

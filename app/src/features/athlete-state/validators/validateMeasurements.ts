import type { BodyMeasurements } from "../models/BodyMeasurements";
import {
  StateValidationCodes,
  type StateValidation,
  type StateValidationIssue,
} from "../models/StateValidation";

export function validateMeasurements(
  measurements: BodyMeasurements,
): StateValidation {
  const issues: StateValidationIssue[] = [];
  const check = (value: number | null, path: string) => {
    if (value != null && value < 0) {
      issues.push({
        code: StateValidationCodes.INVALID_MEASUREMENTS,
        message: `${path} must not be negative.`,
        path,
      });
    }
  };
  check(measurements.heightCm, "bodyMeasurements.heightCm");
  check(measurements.weightKg, "bodyMeasurements.weightKg");
  check(measurements.waistCm, "bodyMeasurements.waistCm");
  check(measurements.chestCm, "bodyMeasurements.chestCm");
  check(measurements.hipsCm, "bodyMeasurements.hipsCm");
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

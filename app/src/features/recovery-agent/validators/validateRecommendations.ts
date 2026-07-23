import type { RecoveryRecommendation } from "../models/RecoveryRecommendation";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateRecommendations(
  recommendations: readonly RecoveryRecommendation[],
): RecoveryValidation {
  const issues = [];
  for (const rec of recommendations) {
    if (!rec.title.trim()) {
      issues.push(
        Object.freeze({
          code: RecoveryValidationCodes.INVALID_RECOMMENDATION,
          message: "Recommendation title empty",
          path: `recommendation:${rec.id}`,
        }),
      );
    }
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

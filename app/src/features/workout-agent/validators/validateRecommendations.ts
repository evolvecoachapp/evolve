import type { WorkoutRecommendation } from "../models/WorkoutRecommendation";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateRecommendations(
  recommendations: readonly WorkoutRecommendation[],
): WorkoutValidation {
  const issues = [];
  for (const rec of recommendations) {
    if (!rec.title.trim() || !rec.detail.trim()) {
      issues.push({
        code: WorkoutValidationCodes.RECOMMENDATION_INVALID,
        message: `Recommendation ${rec.id} missing title/detail.`,
        path: rec.id,
      });
    }
    if (rec.confidence.score < 0 || rec.confidence.score > 1) {
      issues.push({
        code: WorkoutValidationCodes.RECOMMENDATION_INVALID,
        message: `Recommendation ${rec.id} confidence out of range.`,
        path: rec.id,
      });
    }
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

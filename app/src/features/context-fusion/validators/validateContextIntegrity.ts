import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateContextIntegrity(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (!context.id) {
    issues.push({
      code: ContextIntegrityCodes.MISSING_ID,
      message: "Context id is required.",
      path: "id",
    });
  }
  if (!context.athleteId) {
    issues.push({
      code: ContextIntegrityCodes.MISSING_ATHLETE,
      message: "athleteId is required.",
      path: "athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

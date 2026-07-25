import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { isVersionNonNegative } from "../utils/VersionHelpers";

export function validateVersionConsistency(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (!isVersionNonNegative(context.version)) {
    issues.push({
      code: ContextIntegrityCodes.INVALID_VERSION,
      message: "Version components must be non-negative.",
      path: "version",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

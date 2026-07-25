import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateVersionConsistency } from "../validators/validateVersionConsistency";

export function applyVersionPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateVersionConsistency(context);
}

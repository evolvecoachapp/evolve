import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateMergeConsistency } from "../validators/validateMergeConsistency";

export function applyMergePolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateMergeConsistency(context);
}

import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateConflictResolution } from "../validators/validateConflictResolution";

export function applyConflictPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateConflictResolution(context);
}

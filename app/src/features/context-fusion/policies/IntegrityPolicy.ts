import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateContextIntegrity } from "../validators/validateContextIntegrity";

export function applyIntegrityPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateContextIntegrity(context);
}

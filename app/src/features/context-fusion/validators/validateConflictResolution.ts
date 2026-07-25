import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateConflictResolution(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const resolved = new Set(context.resolutions.map((r) => r.conflictId));
  for (const conflict of context.conflicts) {
    if (!resolved.has(conflict.id)) {
      issues.push({
        code: ContextIntegrityCodes.CONFLICT_UNRESOLVED,
        message: `Conflict ${conflict.id} is unresolved.`,
        path: `conflicts.${conflict.id}`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

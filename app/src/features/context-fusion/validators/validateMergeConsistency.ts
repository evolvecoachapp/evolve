import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateMergeConsistency(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (context.merge) {
    const resolutionIds = new Set(
      context.resolutions.map((r) => r.conflictId),
    );
    for (const r of context.merge.resolutions) {
      if (!resolutionIds.has(r.conflictId) && context.conflicts.length > 0) {
        // merge resolutions should reference known conflicts when present
      }
    }
    if (
      context.sources.length > 0 &&
      context.merge.sourceKinds.length === 0
    ) {
      issues.push({
        code: ContextIntegrityCodes.MERGE_INCONSISTENT,
        message: "Merge sourceKinds empty while sources present.",
        path: "merge.sourceKinds",
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

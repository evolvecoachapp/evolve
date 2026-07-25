import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { ContextIntegrityCodes } from "../models/ContextIntegrity";

export function applyPriorityPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const ranks = new Set<number>();
  for (const p of context.priorities) {
    if (p.rank < 0) {
      issues.push({
        code: ContextIntegrityCodes.INTEGRITY_VIOLATION,
        message: "Priority rank must be non-negative.",
        path: `priorities.${p.sourceKind}`,
      });
    }
    if (ranks.has(p.rank)) {
      issues.push({
        code: ContextIntegrityCodes.INTEGRITY_VIOLATION,
        message: "Priority ranks must be unique.",
        path: `priorities.${p.sourceKind}`,
      });
    }
    ranks.add(p.rank);
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

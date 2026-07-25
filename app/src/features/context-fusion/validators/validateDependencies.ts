import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateDependencies(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const sourceKinds = new Set(context.sources.map((s) => s.kind));
  for (const dep of context.dependencies) {
    if (sourceKinds.size > 0 && !sourceKinds.has(dep.from)) {
      issues.push({
        code: ContextIntegrityCodes.DEPENDENCY_BREAK,
        message: `Dependency from-source ${dep.from} is missing.`,
        path: `dependencies.${dep.id}`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

import type { ContextDependency } from "../models/ContextDependency";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectDependencies(
  context: UnifiedCoachingContext,
): readonly ContextDependency[] {
  return context.dependencies;
}

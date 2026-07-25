import type { DecisionDependency } from "../models/DecisionDependency";
import type { CoachingDecision } from "../models/CoachingDecision";
import { planByDependencies } from "../planning/DependencyPlanner";

/**
 * Dependency resolver — reorder by dependency plan.
 */
export function resolveDependencies(input: {
  readonly decisions: readonly CoachingDecision[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly CoachingDecision[] {
  return planByDependencies(input);
}

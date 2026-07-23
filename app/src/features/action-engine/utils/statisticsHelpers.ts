import type { ActionPlan } from "../models/ActionPlan";
import type { ActionStatistics } from "../models/ActionStatistics";
import { averagePriorityRank } from "./priorityHelpers";
import { freezeStatistics } from "./freezeActionPlan";

function countBy(
  values: readonly string[],
): Readonly<Record<string, number>> {
  const result: Record<string, number> = {};
  for (const value of values) {
    result[value] = (result[value] ?? 0) + 1;
  }
  return Object.freeze(result);
}

/**
 * Compute immutable statistics for an ActionPlan.
 */
export function computeActionStatistics(
  plan: ActionPlan,
  candidateCount = 0,
): ActionStatistics {
  const steps = plan.steps;
  return freezeStatistics({
    stepCount: steps.length,
    dependencyCount: plan.dependencies.length,
    constraintCount: plan.constraints.length,
    candidateCount,
    stepsByType: countBy(steps.map((s) => s.type)),
    stepsByPriority: countBy(steps.map((s) => s.priority)),
    stepsByStatus: countBy(steps.map((s) => s.status)),
    averagePriorityRank: averagePriorityRank(steps),
    maxOrder: steps.reduce((max, s) => Math.max(max, s.order), 0),
  });
}

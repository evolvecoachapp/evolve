import type { ActionPlan } from "../models/ActionPlan";
import { ActionStatuses } from "../models/ActionStatus";
import { hasCircularDependencies } from "./dependencyHelpers";
import { averagePriorityRank } from "./priorityHelpers";

/**
 * Lightweight immutable plan metrics for estimation / summaries.
 */
export interface PlanMetrics {
  readonly stepCount: number;
  readonly readyCount: number;
  readonly blockedCount: number;
  readonly dependencyCount: number;
  readonly averagePriorityRank: number;
  readonly hasCycles: boolean;
  readonly estimatedUnits: number;
}

export function computePlanMetrics(plan: ActionPlan): PlanMetrics {
  const readyCount = plan.steps.filter(
    (s) => s.status === ActionStatuses.READY || s.status === ActionStatuses.PLANNED,
  ).length;
  const blockedCount = plan.steps.filter(
    (s) => s.status === ActionStatuses.BLOCKED,
  ).length;

  return Object.freeze({
    stepCount: plan.steps.length,
    readyCount,
    blockedCount,
    dependencyCount: plan.dependencies.length,
    averagePriorityRank: averagePriorityRank(plan.steps),
    hasCycles: hasCircularDependencies(plan.steps),
    estimatedUnits: plan.steps.length + plan.dependencies.length,
  });
}

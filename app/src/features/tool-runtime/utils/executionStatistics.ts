import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionStatistics } from "../models/ToolExecutionStatistics";
import { countDependencies } from "./dependencyHelpers";
import { freezeExecutionStatistics } from "./freezeExecution";

function countBy(
  values: readonly string[],
): Readonly<Record<string, number>> {
  const map: Record<string, number> = {};
  for (const value of values) {
    map[value] = (map[value] ?? 0) + 1;
  }
  return Object.freeze(map);
}

/**
 * Aggregate statistics for a ToolExecutionPlan.
 */
export function computeExecutionStatistics(
  plan: ToolExecutionPlan,
): ToolExecutionStatistics {
  const orders = plan.steps.map((s) => s.order);
  const averageOrder =
    orders.length === 0
      ? 0
      : orders.reduce((a, b) => a + b, 0) / orders.length;
  const maxOrder = orders.length === 0 ? 0 : Math.max(...orders);

  return freezeExecutionStatistics({
    stepCount: plan.steps.length,
    resolvedAdapterCount: plan.steps.filter((s) => s.adapterId != null)
      .length,
    unresolvedToolCount: plan.steps.filter((s) => s.toolId == null).length,
    dependencyCount: countDependencies(plan),
    stepsByStatus: countBy(plan.steps.map((s) => s.status)),
    stepsByActionType: countBy(plan.steps.map((s) => s.actionType)),
    averageOrder,
    maxOrder,
  });
}

/** Alias matching sprint utility naming. */
export const ExecutionStatistics = Object.freeze({
  computeExecutionStatistics,
});

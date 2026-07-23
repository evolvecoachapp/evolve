import type { RoutingPlan } from "../models/RoutingPlan";
import type { RoutingStatistics } from "../models/RoutingStatistics";

export function computeRoutingStatistics(
  plan: RoutingPlan,
  unresolvedCapabilityCount = 0,
): RoutingStatistics {
  return Object.freeze({
    capabilityCount: plan.capabilities.length,
    targetCount: plan.targets.length,
    dependencyCount: plan.dependencies.length,
    decisionCount: plan.decisions.length,
    stepCount: plan.steps.length,
    phaseCount: plan.phases.length,
    nodeCount: plan.graph.nodes.length,
    edgeCount: plan.graph.edges.length,
    unresolvedCapabilityCount,
    requiredTargetCount: plan.targets.filter((t) => t.required).length,
  });
}

export const StatisticsHelpers = Object.freeze({
  computeRoutingStatistics,
});

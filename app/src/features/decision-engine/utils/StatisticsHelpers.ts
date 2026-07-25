import type { DecisionPackage } from "../models/DecisionPackage";
import type { DecisionStatistics } from "../models/DecisionStatistics";

export function computeStatistics(input: {
  readonly candidateCount: number;
  readonly decisionCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly constraintCount: number;
  readonly dependencyCount: number;
  readonly stepCount: number;
  readonly graphNodeCount: number;
  readonly graphEdgeCount: number;
}): DecisionStatistics {
  return Object.freeze({ ...input });
}

export function statisticsFromPackage(
  pkg: DecisionPackage,
): DecisionStatistics {
  return computeStatistics({
    candidateCount: pkg.candidates.length,
    decisionCount: pkg.decisions.length,
    conflictCount: pkg.conflicts.length,
    resolutionCount: pkg.resolutions.length,
    constraintCount: pkg.constraints.length,
    dependencyCount: pkg.dependencies.length,
    stepCount: pkg.plan?.steps.length ?? 0,
    graphNodeCount: pkg.graph?.nodes.length ?? 0,
    graphEdgeCount: pkg.graph?.edges.length ?? 0,
  });
}

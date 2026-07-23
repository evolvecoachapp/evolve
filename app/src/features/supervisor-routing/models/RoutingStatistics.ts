/**
 * Immutable routing plan statistics.
 */
export interface RoutingStatistics {
  readonly capabilityCount: number;
  readonly targetCount: number;
  readonly dependencyCount: number;
  readonly decisionCount: number;
  readonly stepCount: number;
  readonly phaseCount: number;
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly unresolvedCapabilityCount: number;
  readonly requiredTargetCount: number;
}

export const EMPTY_ROUTING_STATISTICS: RoutingStatistics = Object.freeze({
  capabilityCount: 0,
  targetCount: 0,
  dependencyCount: 0,
  decisionCount: 0,
  stepCount: 0,
  phaseCount: 0,
  nodeCount: 0,
  edgeCount: 0,
  unresolvedCapabilityCount: 0,
  requiredTargetCount: 0,
});

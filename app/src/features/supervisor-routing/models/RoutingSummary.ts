import type { RoutingStatistics } from "./RoutingStatistics";

/**
 * Immutable human-readable routing summary.
 */
export interface RoutingSummary {
  readonly id: string;
  readonly planId: string;
  readonly intent: string;
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly phaseKinds: readonly string[];
  readonly description: string;
  readonly statistics: RoutingStatistics;
}

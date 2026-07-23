import type { RoutingContext } from "./RoutingContext";
import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPlan } from "./RoutingPlan";
import type { RoutingStatistics } from "./RoutingStatistics";
import type { RoutingSummary } from "./RoutingSummary";

/**
 * Immutable routing snapshot for Supervisor Runtime consumption.
 */
export interface RoutingSnapshot {
  readonly id: string;
  readonly plan: RoutingPlan;
  readonly context: RoutingContext;
  readonly summary: RoutingSummary;
  readonly statistics: RoutingStatistics;
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly metadata: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

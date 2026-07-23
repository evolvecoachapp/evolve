import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPriorityLevel } from "./RoutingPriority";
import type { RoutingPhaseKind } from "./RoutingPhase";

/**
 * Immutable resolved routing target (agent owning a capability).
 */
export interface RoutingTarget {
  readonly id: string;
  readonly agentId: string;
  readonly capabilityId: string;
  readonly priority: RoutingPriorityLevel;
  readonly phase: RoutingPhaseKind;
  readonly orderIndex: number;
  readonly required: boolean;
  readonly metadata: RoutingMetadata;
}

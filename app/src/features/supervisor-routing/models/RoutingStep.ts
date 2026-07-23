import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPhaseKind } from "./RoutingPhase";
import type { RoutingPriorityLevel } from "./RoutingPriority";

/**
 * Immutable planned routing step (never executed by this module).
 */
export interface RoutingStep {
  readonly id: string;
  readonly targetId: string;
  readonly agentId: string;
  readonly capabilityId: string;
  readonly phase: RoutingPhaseKind;
  readonly priority: RoutingPriorityLevel;
  readonly orderIndex: number;
  readonly dependsOnStepIds: readonly string[];
  readonly metadata: RoutingMetadata;
}

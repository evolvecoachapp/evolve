import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingPriorityLevel } from "./RoutingPriority";

/**
 * Immutable capability requirement within a routing request / plan.
 */
export interface RoutingCapability {
  readonly id: string;
  readonly capabilityId: string;
  readonly required: boolean;
  readonly priority: RoutingPriorityLevel;
  readonly dependsOn: readonly string[];
  readonly metadata: RoutingMetadata;
}

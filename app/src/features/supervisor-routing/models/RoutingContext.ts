import type { RoutingMetadata } from "./RoutingMetadata";
import type { RoutingRequest } from "./RoutingRequest";

/**
 * Immutable routing context assembled before planning.
 */
export interface RoutingContext {
  readonly id: string;
  readonly request: RoutingRequest;
  readonly registryId: string | null;
  readonly capabilityIds: readonly string[];
  readonly candidateAgentIds: readonly string[];
  readonly metadata: RoutingMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

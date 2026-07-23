import type { RoutingCapability } from "./RoutingCapability";
import type { RoutingConstraint } from "./RoutingConstraint";
import type { RoutingDependency } from "./RoutingDependency";
import type { RoutingMetadata } from "./RoutingMetadata";

/**
 * Immutable user/coach routing request (input only — never executed here).
 */
export interface RoutingRequest {
  readonly id: string;
  readonly coachAgentId: string;
  readonly intent: string;
  readonly requiredCapabilities: readonly RoutingCapability[];
  readonly dependencies: readonly RoutingDependency[];
  readonly constraints: readonly RoutingConstraint[];
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly metadata: RoutingMetadata;
  readonly createdAt: string;
}

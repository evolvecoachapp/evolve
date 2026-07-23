import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "./CoachSupervisorRequest";

/**
 * Immutable coordination context.
 */
export interface CoordinationContext {
  readonly id: string;
  readonly requestId: string;
  readonly request: CoachSupervisorRequest;
  readonly routingPlanId: string | null;
  readonly agentIds: readonly string[];
  readonly capabilityIds: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

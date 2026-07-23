import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorRequest } from "./CoachSupervisorRequest";

/**
 * Immutable orchestration context.
 */
export interface CoachSupervisorContext {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly routingRequestId: string | null;
  readonly collaborationRequestId: string | null;
  readonly selectedAgentIds: readonly string[];
  readonly selectedCapabilityIds: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

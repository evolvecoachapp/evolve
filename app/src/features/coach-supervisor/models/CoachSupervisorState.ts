import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorExecutionStatus } from "./CoachSupervisorExecution";
import { CoachSupervisorExecutionStatuses } from "./CoachSupervisorExecution";

/**
 * Frozen session state snapshot.
 */
export interface CoachSupervisorState {
  readonly id: string;
  readonly requestId: string | null;
  readonly planId: string | null;
  readonly status: CoachSupervisorExecutionStatus;
  readonly currentAgentId: string | null;
  readonly errorMessage: string | null;
  readonly metadata: CoachSupervisorMetadata;
  readonly updatedAt: string;
}

export { CoachSupervisorExecutionStatuses };

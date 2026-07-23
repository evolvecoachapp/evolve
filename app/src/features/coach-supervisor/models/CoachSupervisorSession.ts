import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorState } from "./CoachSupervisorState";

/**
 * Immutable supervisor session descriptor.
 */
export interface CoachSupervisorSession {
  readonly id: string;
  readonly requestId: string | null;
  readonly state: CoachSupervisorState;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}
